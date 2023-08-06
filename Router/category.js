const express = require("express");
const Category = require("../model/Category");
const router = express.Router();
const slugify = require("slugify");

//get all categories
router.get("/categories", async (req, res) => {
  try {
    const category = await Category.find().populate("subcategories");
    res.status(200).json({
      options: category,
      isSuccess: true,
      totalCategory: category.length,
    });
  } catch (error) {
    res.status(400).json({
      error: error,
      message: "Error Getting Category",
      isSuccess: false,
    });
  }
});

router.delete("/category/:id", async (req, res) => {
  try {
    const cat = await Category.findByIdAndDelete({ _id: req.params.id });
    res.status(200).json({
      cat: cat,
      isSuccess: true,
      message: "category deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: error,
      message: "Error deleting Category",
      isSuccess: false,
    });
  }
});
router.delete("/categories", async (req, res) => {
  try {
    await Category.deleteMany();
    res.status(200).json({
      isSuccess: true,
      message: "all categories deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: error,
      message: "Error deleting Categories",
      isSuccess: false,
    });
  }
});

// post category
router.post("/categories", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      error: `Category name is required`,
      message: `Category name is required`,
      isSuccess: false,
    });
  }

  const formattedName = name.replace(/\b\w/g, (c) => c.toUpperCase()); // Capitalize the first letter of every word
  const slug = slugify(formattedName, {
    replacement: "_",
    lower: true,
  });

  try {
    const existingCategory = await Category.findOne({ name: formattedName });

    if (existingCategory) {
      return res.status(400).json({
        error: `Category with the name '${formattedName}' already exists`,
        isSuccess: false,
      });
    }

    const newCategory = await Category.create({ name: formattedName, slug });

    res.status(201).json({
      category: newCategory,
      message: `${newCategory.name} created successfully`,
      isSuccess: true,
    });
  } catch (error) {
    res.status(500).json({
      error: error,
      message: "Error creating category",
      isSuccess: false,
    });
  }
});

module.exports = router;
