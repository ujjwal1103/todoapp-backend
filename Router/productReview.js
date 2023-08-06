const express = require("express");
const router = express.Router();
const ProductReview = require("../model/ProductReview");

// POST route to create a new product review
router.post("/productReviews", async (req, res) => {
  try {
    const { product, user, rating, title, description } = req.body;

    // Create a new product review using the ProductReview model
    const newReview = new ProductReview({
      product,
      user,
      rating,
      title,
      description,
    });

    // Save the review to the database
    const savedReview = await newReview.save();

    res.status(201).json({
        isSuccess: true,
        reviews: savedReview
    });
  } catch (error) {
    res.status(500).json({ error: "Could not create the product review." });
  }
});

// GET route to fetch all product reviews for a specific product
router.get("/productReviews/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;

    // Find all reviews for the specified product using the productId
    const reviews = await ProductReview.find({ product: productId })
      .populate("product")
      .populate("user");

    res.status(200).json({
      isSuccess: true,
      reviews: reviews,
    });
  } catch (error) {
    res.status(500).json({ error: "Could not fetch product reviews." });
  }
});

// PUT route to update the helpful votes count for a product review
router.put("/productReviews/:reviewId/helpful", async (req, res) => {
  try {
    const reviewId = req.params.reviewId;

    // Find the product review by its ID
    const review = await ProductReview.findById(reviewId);

    if (!review) {
      return res.status(404).json({ error: "Review not found." });
    }

    // Increment the helpfulVotes count by 1
    review.helpfulVotes += 1;

    // Save the updated review with the new helpfulVotes count
    const updatedReview = await review.save();

    res.status(200).json(updatedReview);
  } catch (error) {
    res.status(500).json({ error: "Could not update helpful votes." });
  }
});

module.exports = router;
