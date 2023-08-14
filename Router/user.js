const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../model/User.js"); // Assuming your user model file is in the same directory
const { requireSignIn, isAdmin } = require("../middleware/authMiddleware.js");
const Conversation = require("../model/Conversation.js");
const router = express.Router();

const isValidEmail = (email) => {
  const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return email.match(regex);
};

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
    const { email, password, name, mobileNumber, isAdmin } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        error: "Empty Field",
        message: "All fields are required",
        isSuccess: false,
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "Email Validation",
        message: "Invalid Email Address",
        isSuccess: false,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(401).json({
        error: "Email already exists",
        message: "Email already exists",
        isSuccess: false,
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashPassword,
      name,
      mobileNumber,
      isAdmin,
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

// Login a account
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

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "Email Validation",
        message: "Invalid Email Address",
        isSuccess: false,
      });
    }
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user || user.isGoogleLogin) {
      return res.status(401).json({
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
    res.status(500).json({
      error: error,
      message: "Internal server error",
      isSuccess: false,
    });
  }
});

router.put("/user", requireSignIn, async (req, res) => {
  const { userId } = req.user;
  const { email } = req.body;

  if (email && !isValidEmail(email)) {
    return res.status(400).json({
      error: "Email Validation",
      message: "Invalid Email Address",
      isSuccess: false,
    });
  }

  if (email) {
    const existingUser = await User.findOne({ email });

    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(401).json({
        error: "Email already exists",
        message: "Email already exists",
        isSuccess: false,
      });
    }
  }

  try {
    let user = await User.findById(userId).select("-password -__v");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Check if any updates are needed by comparing the current user data with the request body
    let updates = {};
    let isUpdateRequired = false;
    for (const key in req.body) {
      if (user[key] !== req.body[key]) {
        updates[key] = req.body[key];
        isUpdateRequired = true;
      }
    }
    if (isUpdateRequired) {
      user = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true }
      ).select("-password -__v");
    }

    res.json({
      isSuccess: true,
      message: isUpdateRequired
        ? "User updated successfully"
        : "No updates required",
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
});

//get a user
router.get("/user", requireSignIn, async (req, res) => {
  const { userId } = req.user;
  try {
    let user = await User.findOne({ _id: userId }).select("-password -__v");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ isSuccess: true, message: "user", user });
  } catch (error) {
    res
      .status(500)
      .json({ isSuccess: false, message: "Internal Server Error" });
  }
});

router.put("/user/dp", requireSignIn, isAdmin, async (req, res) => {
  const { userId } = req.user;
  const pic = req.body.pic;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      { _id: userId },
      { dp: pic },
      { new: true }
    ).select("-password");

    if (updatedUser) {
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

router.get("/users", requireSignIn, isAdmin, async (req, res) => {
  try {
    let users = await User.find();
   
    res.json({ isSuccess: true, message: "user", users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ isSuccess: false, message: "Server Error" });
  }
});

router.get("/conversation/users", requireSignIn, async (req, res) => {
  try {
    const { userId } = req.user;
    const { search } = req.query;

    const conversations = await Conversation.find({ participants: userId });

    const participants = conversations.reduce((acc, conversation) => {
      return [...acc, ...conversation.participants];
    }, []);

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
    const users = await User.find(filters).select("dp _id name email");
    res.json({ isSuccess: true, message: "user", users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ isSuccess: false, message: "Server Error" });
  }
});

module.exports = router;
