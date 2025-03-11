const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Pending", "Shipped", "Delivered"],
    default: "Pending",
  },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
