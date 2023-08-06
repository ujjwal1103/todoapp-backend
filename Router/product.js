const express = require("express");
const Product = require("../model/Product");
const { requireSignIn, isAdmin } = require("../middleware/authMiddleware");
const { default: slugify } = require("slugify");
const SubCategory = require("../model/SubCategory");
const Category = require("../model/Category");
const Subcategory = require("../model/SubCategory");

const router = express.Router();

// create a new product in mongodb
router.post("/product", requireSignIn, isAdmin, async (req, res) => {
  try {
    const newProduct = new Product({ ...req.body });
    const findProduct = await Product.findOne({ title: req.body.title });
    if (findProduct) {
      return res.status(400).json({
        error: `${req.body.title} Already Exist`,
        isSuccess: false,
      });
    }

    // Check if the subcategory belongs to the specified category
    const category = await Category.findById(req.body.category);
    const subcategory = await Subcategory.findById(req.body.subcategory);

    if (
      !category ||
      !subcategory ||
      String(subcategory.category) !== String(category._id)
    ) {
      return res.status(400).json({
        error: "Invalid category or subcategory",
        isSuccess: false,
      });
    }

    const product = await newProduct.save();

    res.status(200).json({
      product: product,
      message: "New product created successfully",
      isSuccess: true,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: "Error creating new product",
      isSuccess: false,
    });
  }
});

router.put("/product/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id);
  console.log(req.body);
  try {
    const product = await Product.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    )
      .populate("category")
      .populate("subcategory");
    res.status(200).json({
      product: product,
      message: " product updated successfully",
      isSuccess: true,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: "Error updating new product",
      isSuccess: false,
    });
  }
});

router.delete(
  "/product/deleteAll",
  requireSignIn,
  isAdmin,
  async (req, res) => {
    try {
      await Product.deleteMany();
      res.status(200).json({
        message: " product deleted successfully",
        isSuccess: true,
      });
    } catch (err) {
      console.log(error);
      res.status(400).json({
        error: "Error creating new product",
        isSuccess: false,
      });
    }
  }
);
router.delete("/product/:id", requireSignIn, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await Product.findOneAndDelete({ _id: id });
    res.status(200).json({
      message: " product deleteded successfully",
      isSuccess: true,
    });
  } catch (err) {
    console.log(error);
    res.status(400).json({
      error: "Error creating new product",
      isSuccess: false,
    });
  }
});

// get all products from mongodb
router.get("/products", async (req, res) => {
  const q = req.query;
  const filters = {
    ...(q?.search && {
      $or: [
        { brand: { $regex: q.search, $options: "i" } },
        { title: { $regex: q.search, $options: "i" } },
        { subcategory: await getSubCategoryByName(q.search) },
        { category: await getCategoryByName(q.search) },
      ],
    }),
    ...(q.subcategory && {
      subcategory: q.subcategory,
    }),
    ...(q.category && {
      category: q.category,
    }),
  };
  try {
    const products = await Product.find(filters)
      .sort({ updatedAt: -1 })
      .populate("category")
      .populate("subcategory");
    res.status(200).json({
      products: products,
      isSuccess: true,
      totalProduct: products.length,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: "Error Getting Products",
      isSuccess: false,
    });
  }
});

// get single product from mongodb
router.get("/product/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findOne({ _id: id })
      .populate("category")
      .populate("subcategory");
    if (product) {
      res.status(200).json({
        product: product,
        isSuccess: true,
      });
    } else {
      res.status(200).json({
        error: `product with id=${id} not found`,
        isSuccess: false,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: `Internal server error`,
      isSuccess: false,
    });
  }
});

router.delete("/products", async (req, res) => {
  try {
    await Product.deleteMany();
    res.status(200).json({
      isSuccess: true,
      message: "all products deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: "Error deleting products",
      isSuccess: false,
    });
  }
});

router.get("/brands/:subcategory", async (req, res) => {
  const subcategory = req.params.subcategory;

  try {
    const isValidSubcategory = await Subcategory.exists({ _id: subcategory });
    if (!isValidSubcategory) {
      return res.json({ success: false, message: "Invalid subcategory" });
    }

    const brands = await Product.distinct("brand", {
      subcategory: subcategory,
    });
    if (brands.length === 0) {
      return res.json({
        success: true,
        message: "No brands found for the given subcategory",
        brands: [],
      });
    }

    res.json({
      success: true,
      message: "Brands retrieved successfully",
      brands: brands,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.post("/products/filter", async (req, res) => {
  const filter = req.body;
  const q = req.query
  const filters = {
    ...(q?.search && {
      $or: [
        { brand: { $regex: q.search, $options: "i" } },
        { title: { $regex: q.search, $options: "i" } },
        { subcategory: await getSubCategoryByName(q.search) },
        { category: await getCategoryByName(q.search) },
      ],
    }),
    ...(q.subcategory && {
      subcategory: q.subcategory,
    }),
    ...(q.category && {
      category: q.category,
    }),
  };
  const subcategory = req.query.subcategory;
  try {
    const { brand, minPrice, maxPrice, ratings, sort } = filter;
    const query = {};

    if (brand && brand.length !== 0 && Array.isArray(brand)) {
      query.brand = { $in: brand };
    }

    if (minPrice) {
      query.price = { ...query.price, $gte: parseInt(minPrice) };
    }

    if (maxPrice) {
      query.price = { ...query.price, $lte: parseInt(maxPrice) };
    }

    if (ratings && ratings.length !== 0 && Array.isArray(ratings)) {
      const ratingValues = ratings.map((rating) => parseInt(rating));
      query.rating = { $in: ratingValues };
    }

    if (subcategory) {
      query.subcategory = subcategory;
    }
    let sortOption = {};
    switch (sort.value) {
      case "popularity":
        sortOption = { popularity: -1 };
        break;
      case "newest":
        sortOption = { updatedAt: -1 };
        break;
      case "priceLowToHigh":
        sortOption = { price: 1 };
        break;
      case "priceHighToLow":
        sortOption = { price: -1 };
        break;
      default:
        sortOption = { popularity: -1 };
        break;
    }

    const products = await Product.find({ ...query,...filters })
      .sort(sortOption)
      .populate("category")
      .populate("subcategory");

    res.json({
      isSuccess: true,
      totalProduct: products.length,
      products: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

async function getSubCategoryByName(categoryName) {
  console.log(categoryName);
  try {
    const category = await SubCategory.findOne({
      name: { $regex: categoryName, $options: "i" },
    });
    return category ? category._id.toString() : null;
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function getCategoryByName(categoryName) {
  console.log(categoryName);
  try {
    const category = await Category.findOne({
      name: { $regex: categoryName, $options: "i" },
    });
    return category ? category._id.toString() : null;
  } catch (error) {
    console.log(error);
    return null;
  }
}
module.exports = router;
