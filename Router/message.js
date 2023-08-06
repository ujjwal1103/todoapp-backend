const express = require("express");
const router = express.Router();
const Message = require("../model/Message");
const Conversation = require("../model/Conversation");

router.post("/message", async (req, res) => {
  try {
    const newMessage = req.body; 
    newMessage.seen = false; /// Assuming the request body contains the message data in JSON format
    const message = await Message.create(newMessage);
    console.log(message);

    const conversation = await Conversation.findByIdAndUpdate(
      { _id: req.body.conversationId },
      { lastMessage: message._id },
      { new: true }
    );
    
    res.status(201).json({
      isSuccess: true,
      message: message,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      isSuccess: false,
      message: "Failed to create the message.",
      error: error,
    });
  }
});

router.get("/messages/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId });

    messages.forEach(async (message) => {
      if (!message.seen) {
        message.seen = true;
        await message.save();
      }
    });

    if (messages.length === 0) {
      return res.status(404).json({
        isSuccess: false,
        message: "No messages found for this conversation.",
      });
    }
    res.status(200).json({
      isSuccess: true,
      messages: messages,
    });
  } catch (error) {
    res.status(500).json({
      isSuccess: false,
      message: "Failed to fetch messages for the conversation.",
      error,
    });
  }
});

router.delete("/messages/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Find the last message in the conversation
    const lastMessage = await Message.findOne({
      conversationId: conversationId,
    }).sort({ createdAt: -1 });

    const deletedMessages = await Message.deleteMany({
      conversationId: conversationId,
    },{ seen: false });

    if (deletedMessages.deletedCount === 0) {
      return res.status(404).json({
        isSuccess: false,
        message: "No messages found for this conversation.",
      });
    }

    // If there are more messages left, update the lastMessage field in the Chat model
    if (lastMessage) {
      await Chat.findByIdAndUpdate(conversationId, {
        lastMessage: lastMessage._id,
      });
    } else {
      // If there are no more messages, set the lastMessage field to null
      await Chat.findByIdAndUpdate(conversationId, { lastMessage: null });
    }

    res.status(200).json({
      isSuccess: true,
      message: "All messages for this conversation have been deleted.",
    });
  } catch (error) {
    res.status(500).json({
      isSuccess: false,
      message: "Failed to delete messages for the conversation.",
      error,
    });
  }
});

module.exports = router;
