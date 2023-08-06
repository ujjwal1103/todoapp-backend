const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    subTitle: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
    },
    quantity: {
      type: Number,
      required: true,
    },
    MRP: {
      type: Number,
      required: true,
    },
    images: {
      type: [String],
      required: true,
    },
    specifications: {
      type: [String],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
      required: true,
    },
    colors: {
      type: "array",
      items: {
        type: "object",
        properties: {
          value: {
            type: "string",
            pattern: "^#[0-9a-fA-F]{6}$",
          },
        },
        required: ["value"],
      },
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
