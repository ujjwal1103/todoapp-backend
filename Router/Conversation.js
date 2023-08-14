const express = require("express");
const router = express.Router();
const Conversation = require("../model/Conversation");
const mongoose = require("mongoose");
const Message = require("../model/Message");
const { requireSignIn } = require("../middleware/authMiddleware");

router.post("/conversation/:id", requireSignIn, async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;
  const participants = [userId, id];
  if (
    !Array.isArray(participants) ||
    participants.length < 2 ||
    !areDistinct(participants)
  ) {
    return res.status(400).json({
      isSuccess: false,
      message:
        "Invalid participants. The 'participants' field must be an array with at least two distinct elements.",
    });
  }

  const existingConversation = await Conversation.findOne({
    participants: { $all: participants },
  }).populate({
    path: "participants",
    select: "-password -__v",
  });;

  if (existingConversation) {
    return res.status(409).json({
      isSuccess: false,
      message: "A conversation with these participants already exists.",
      conversation: existingConversation,
    });
  }

  const newConversation = new Conversation({ participants });
  try {
    await Conversation.create(newConversation);

    const conversation = await Conversation.findOne({
      _id: newConversation._id,
    }).populate({
      path: "participants",
      select: "-password",
    });

    res.status(200).json({
      isSuccess: true,
      conversation: conversation,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      isSuccess: false,
      error: error,
      message: "Conversation failed to load",
    });
  }
});

function areDistinct(arr) {
  const set = new Set(arr);
  return set.size === arr.length;
}

// GET route to retrieve a particular conversation by senderId and receiverId

// GET route to retrieve all conversations of a user by userId
router.get("/conversations", requireSignIn, async (req, res) => {
  const { userId } = req.user;
  try {
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate({
        path: "participants",
        select: "-password -isAdmin -__v -isGoogleLogin -isEmailVerfied",
      })
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    if (conversations.length === 0) {
      return res.status(404).json({
        isSuccess: false,
        message: "Start New conversations",
      });
    }

    res.status(200).json({
      isSuccess: true,
      conversations,
    });
  } catch (error) {
    res.status(500).json({
      isSuccess: false,
      error: error,
      message: "Failed to retrieve conversations for the user",
    });
  }
});

// delete a conversation
router.delete("/conversation/:id", async (req, res) => {
  try {
    const conversationId = req.params.id;

    // Delete the conversation and its messages using a transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    // Step 1: Delete messages associated with the conversation
    await Message.deleteMany({ conversationId }, { session });

    // Step 2: Delete the conversation
    await Conversation.findByIdAndDelete(conversationId, { session })
      .populate("participants")
      .populate("lastMessage");

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      isSuccess: true,
      message: "Conversation and messages deleted successfully.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      isSuccess: false,
      error: "Something went wrong while deleting the conversation.",
    });
  }
});

module.exports = router;
