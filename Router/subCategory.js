const express = require("express");
const Subcategory = require("../model/SubCategory");
const slugify = require("slugify");
const Category = require("../model/Category");
const { requireSignIn, isAdmin } = require("../middleware/authMiddleware");
const router = express.Router();

// Get all subcategories
router.get("/subcategories", async (req, res) => {
  try {
    const subcategories = await Subcategory.find().populate("category");
    res.status(200).json({
      options: subcategories,
      isSuccess: true,
      totalSubcategories: subcategories.length,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: "Error getting subcategories",
      isSuccess: false,
    });
  }
});
router.get("/subcategories/:id", async (req, res) => {
  const id = req.params.id
  try {
    const subcategories = await Subcategory.find({category:id}).populate("category");
    res.status(200).json({
      options: subcategories,
      isSuccess: true,
      totalSubcategories: subcategories.length,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: "Error getting subcategories",
      isSuccess: false,
    });
  }
});

// delete single subcategory
router.delete("/subcategory/:id", requireSignIn, isAdmin,async (req, res) => {
  try {
    // Find the subcategory to be deleted
    const deletedSubcategory = await Subcategory.findByIdAndDelete(
      req.params.id
    );

    // Remove the subcategory ID from the corresponding category's subcategories array
    const updatedCategory = await Category.findByIdAndUpdate(
      deletedSubcategory.category,
      { $pull: { subcategories: deletedSubcategory._id } },
      { new: true }
    );

    res.status(200).json({
      subcategory: deletedSubcategory,
      isSuccess: true,
      message: "Subcategory deleted successfully",
      updatedCategory,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: "Error deleting subcategory",
      isSuccess: false,
    });
  }
});

router.delete("/subcategories",requireSignIn, isAdmin, async (req, res) => {
  try {
    await Subcategory.deleteMany();
    res.status(200).json({
      isSuccess: true,
      message: "all categories deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: "Error deleting Category",
      isSuccess: false,
    });
  }
});

// Create a new subcategory
router.post("/subcategories", requireSignIn, isAdmin, async (req, res) => {
  const { name, category } = req.body;

  if (!name) {
    return res.status(400).json({
      error: "Subcategory name is required",
      isSuccess: false,
    });
  }

  if (!category) {
    return res.status(400).json({
      error: "Category selection is required",
      isSuccess: false,
    });
  }

  const formattedName = name.replace(/\b\w/g, (c) => c.toUpperCase()); // Capitalize the first letter of every word

  const slug = slugify(formattedName, {
    replacement: "_",
    lower: true,
  });

  try {
    // Check if the given category is valid
    const isValidCategory = await Category.exists({ _id: category });
    if (!isValidCategory) {
      return res.status(400).json({
        error: "Invalid category ID",
        isSuccess: false,
      });
    }

    // Check if a subcategory with the same name already exists within the category
    const existingSubcategory = await Subcategory.findOne({ name: formattedName, category });
    if (existingSubcategory) {
      return res.status(400).json({
        error: `Subcategory '${formattedName}' already exists in the selected category`,
        isSuccess: false,
      });
    }

    // Create the new subcategory
    const newSubCategory = await Subcategory.create({ name: formattedName, slug, category });

    // Update the category's subcategories array
    const updatedCategory = await Category.findByIdAndUpdate(
      category,
      { $push: { subcategories: newSubCategory._id } },
      { new: true }
    );

    res.status(201).json({
      message: `${newSubCategory.name} created successfully`,
      isSuccess: true,
      updatedCategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Error creating subcategory",
      isSuccess: false,
    });
  }
});


module.exports = router;
