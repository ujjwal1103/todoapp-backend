const express = require("express");
const Address = require("../model/Address");
const { requireSignIn } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/address", requireSignIn, async (req, res) => {
  const userId = req.user.userId;
  try {
    const data = await Address.create({ ...req.body, user: userId });
    if (data) {
      return res.status(201).json({
        address: data,
        message: "Created Success fully",
        isSuccess: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
      message: "Internal server error",
      isSuccess: false,
    });
  }
});

router.get("/address", requireSignIn, async (req, res) => {
  const userId = req.user.userId;
  try {
    const data = await Address.find({ user: userId }).select("-__v");
    if (data) {
      return res.status(201).json({
        addresses: data,
        message: "address",
        isSuccess: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
      message: "Internal server error",
      isSuccess: false,
    });
  }
});
router.delete("/address/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const data = await Address.findOneAndDelete({ _id: id });
    if (data) {
      return res.status(201).json({
        addresses: data,
        message: "Address deleted successfully",
        isSuccess: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
      message: "Internal server error",
      isSuccess: false,
    });
  }
});

router.put("/address/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const updatedData = req.body;
    const data = await Address.findByIdAndUpdate({ _id: id }, updatedData, {
      new: true,
    }).select("-__v");
    if (data) {
      return res.status(200).json({
        address: data,
        message: "Address updated successfully",
        isSuccess: true,
      });
    } else {
      return res.status(404).json({
        message: "Address not found",
        isSuccess: false,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error.message || "Internal server error",
      message: "Internal server error",
      isSuccess: false,
    });
  }
});

module.exports = router;
