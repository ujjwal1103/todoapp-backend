const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../model/User.js"); // Assuming your user model file is in the same directory
const { requireSignIn } = require("../middleware/authMiddleware.js");
const Conversation = require("../model/Conversation.js");

const router = express.Router();

// creat a new account
router.post("/register", async (req, res) => {
  if (req.body.accessToken && req.body.isGoogleLogin) {
    const { email, name, dp } = req.body;
    let user = await User.findOne({ email: email }).select("-password");
    if (!user) {
      // Create a new user using the Google user data
      const newUser = new User({
        email: email,
        name: name,
        password: "googleSignUp",
        dp: dp,
        isGoogleLogin: true,
      });

      const createdUser = await newUser.save();
      const finalUser = await User.findOne({ _id: createdUser._id }).select(
        "-password"
      );
      const token = jwt.sign({ userId: finalUser._id }, "your-secret-key", {
        expiresIn: "365d",
      });
      if (finalUser) {
        return res.status(201).json({
          user: finalUser,
          message: "Login successful",
          isSuccess: true,
          token,
        });
      }
    } else {
      const token = jwt.sign({ userId: user._id }, "your-secret-key", {
        expiresIn: "365d",
      });

      return res.status(201).json({
        user: user,
        message: "Login successful",
        isSuccess: true,
        token,
      });
    }
  }
  try {
    const { email, password, name, mobileNumber } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Empty Field", message: "All fields are required", isSuccess: false });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(401)
        .json({error: "Email already exists",message: "Email already exists", isSuccess: false });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashPassword,
      name,
      mobileNumber,
    });
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, "your-secret-key", {
      expiresIn: "365d",
    });
    res
      .status(201)
      .json({ message: "Registration successful", isSuccess: true, token });
  } catch (error) {
    res
      .status(500)
      .json({ error: error, message: error.message, isSuccess: false });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  if (req.body.accessToken && req.body.isGoogleLogin) {
    const { email, name, dp } = req.body;
    let user = await User.findOne({ email: email }).select("-password");
    if (!user) {
      // Create a new user using the Google user data
      const newUser = new User({
        email: email,
        name: name,
        password: "googleSignUp",
        dp: dp,
        isGoogleLogin: true,
      });

      const createdUser = await newUser.save();
      const finalUser = await User.findOne({ _id: createdUser._id }).select(
        "-password"
      );
      const token = jwt.sign({ userId: finalUser._id }, "your-secret-key", {
        expiresIn: "365d",
      });
      if (finalUser) {
        return res.status(201).json({
          user: finalUser,
          message: "Login successful",
          isSuccess: true,
          token,
        });
      }
    } else {
      const token = jwt.sign({ userId: user._id }, "your-secret-key", {
        expiresIn: "365d",
      });

      return res.status(201).json({
        user: user,
        message: "Login successful",
        isSuccess: true,
        token,
      });
    }
  }
  try {
    const { email, password } = req.body;
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user || user.isGoogleLogin) {
      return res
        .status(401)
        .json({
          error: "Invalid email or password",
          message: "Invalid email or password",
          isSuccess: false,
        });
    }
    // Compare the provided password with the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ message: "Invalid email or password", isSuccess: false });
    }
    // Login successful
    const token = jwt.sign({ userId: user._id }, "your-secret-key", {
      expiresIn: "365d",
    });
    const newuser = {
      email: user.email,
      name: user.name,
      dp: user.dp,
      isAdmin: user.isAdmin,
      _id: user._id,
      gender: user.gender,
      mobileNumber: user.mobileNumber,
    };
    console.log(newuser);
    res.status(201).json({
      user: newuser,
      message: "Login successful",
      isSuccess: true,
      token,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        error: error,
        message: "Internal server error",
        isSuccess: false,
      });
  }
});
router.get("/test", requireSignIn, async (req, res) => {
  res.json("test api");
});

router.put("/user/:id", requireSignIn, async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  try {
    let user = await User.findByIdAndUpdate(id, { ...req.body });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Update user with the new values from the request body
    res.json({ isSuccess: true, message: "User updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    let user = await User.findOne({ _id: id }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ isSuccess: true, message: "user", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ isSuccess: false, message: "Server Error" });
  }
});
router.put("/user/dp/:id", async (req, res) => {
  const userId = req.params.id; // Get the user ID from the request parameters.
  const pic = req.body.pic; // Get the new value for the profilepc field from the request body.

  try {
    // Find the user document by ID and update the profilepc field.
    const updatedUser = await User.findByIdAndUpdate(
      { _id: userId },
      { dp: pic },
      { new: true }
    ).select("-password");

    if (updatedUser) {
      // If the document was updated successfully, send the updated user as the response.
      res.json({
        isSuccess: true,
        user: updatedUser,
      });
    } else {
      // If the user with the provided ID was not found, send an error response.
      res.status(404).json({ isSuccess: false, error: "User not found." });
    }
  } catch (error) {
    // If any error occurs during the update process, send an error response.
    res
      .status(500)
      .json({ isSuccess: false, error: "Error updating user profilepc." });
  }
});

router.get("/users", async (req, res) => {
  try {
    let users = await User.find();
    res.json({ isSuccess: true, message: "user", users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ isSuccess: false, message: "Server Error" });
  }
});

router.get("/conversation/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { search } = req.query;

    // Find all conversations where the given userId is a participant
    const conversations = await Conversation.find({ participants: userId });

    console.log(conversations);

    if (conversations.length === 0) {
      // If no conversations found, return all users
      const users = await User.find();
      res.json({ isSuccess: true, message: "user", users });
    } else {
      // If conversations found, get an array of all participant IDs from all conversations
      const participants = conversations.reduce((acc, conversation) => {
        return [...acc, ...conversation.participants];
      }, []);

      // Remove duplicate participant IDs
      const uniqueParticipants = [...new Set(participants)];

      const filters = {
        ...(search && {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }),
        _id: { $ne: userId, $nin: uniqueParticipants },
      };

      // Find all users who are not in any conversation (excluding the current user)
      const users = await User.find(filters).select("dp _id name");

      res.json({ isSuccess: true, message: "user", users });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ isSuccess: false, message: "Server Error" });
  }
});

module.exports = router;
