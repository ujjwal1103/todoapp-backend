const express = require("express");
const SliderImage = require("../model/SliderImages");
const { requireSignIn, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// create a new product in mongodb
router.post("/SliderImages",requireSignIn, isAdmin, async (req, res) => {
  try {
    // Check if there are already four images in the database
    const count = await SliderImage.countDocuments();
    if (count >= 4) {
      res.status(400).json({
        error: "Maximum limit reached. You can only add four images.",
        isSuccess: false,
      });
      return; // Exit the function
    }

    const newSliderImage = new SliderImage({ ...req.body });
    const findUrl = await SliderImage.findOne({ imageUrl: req.body.imageUrl });
    if (findUrl) {
      res.status(400).json({
        error: `${req.body.imageUrl} already exists`,
        isSuccess: false,
      });
      return; // Exit the function
    }

    const image = await newSliderImage.save();
    res.status(200).json({
      image: image,
      message: "New image created successfully",
      isSuccess: true,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: "Error creating new image",
      isSuccess: false,
    });
  }
});

router.get("/sliderImages", async (req, res) => {
  try {
    const sliderImages = await SliderImage.find();
    res.status(200).json({
      sliderImages: sliderImages,
      isSuccess: true,
      totalImages: sliderImages.length,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: "Error Getting Images",
      isSuccess: false,
    });
  }
});
router.delete("/sliderImages/:id", requireSignIn, isAdmin,async (req, res) => {
  const { id } = req.params;

  try {
    const deletedImage = await SliderImage.findByIdAndDelete(id);

    if (!deletedImage) {
      return res.status(400).json({
        error: `${id} not found`,
        isSuccess: false,
      });
    }

    res.status(200).json({
      message: " image deleted successfully",
      isSuccess: true,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: "Error deleting Image",
      isSuccess: false,
    });
  }
});

module.exports = router;
