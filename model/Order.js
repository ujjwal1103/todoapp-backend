const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],
  shipping_address: {
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zip_code: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
  },
  payment: {
    method: {
      type: String,
      enum: ["credit_card", "upi", "cash_on_delivery", "other"],
      required: true,
    },
    upi_id: {
      type: String, // Store the UPI ID here if the payment method is "upi"
    },
    upi_transaction_id: {
      type: String, // Store the transaction ID here if the payment method is "upi"
    },
    card_number: {
      type: String, // Store the credit card number here if the payment method is "credit_card"
    },
    expiration_date: {
      type: String, // Store the credit card expiration date here if the payment method is "credit_card"
    },
    cvv: {
      type: String, // Store the credit card CVV here if the payment method is "credit_card"
    },
  },
  order_date: {
    type: Date,
    required: true,
  },
  order_status: {
    type: String,
    enum: ["pending", "shipped", "delivered", "cancelled"],
    required: true,
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
