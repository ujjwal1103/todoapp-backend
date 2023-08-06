const express = require("express");
const router = express.Router();
const Order = require("../model/Order");

router.post("/order", async (req, res) => {
  try {
    const orderData = req.body; // Assuming the request body contains the order data in JSON format
    const createdOrder = await Order.create(orderData);
    res.status(201).json(createdOrder);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create the order.", error });
  }
});

module.exports = router;
