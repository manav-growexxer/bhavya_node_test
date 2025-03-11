const express = require("express");
const router = express.Router();
const orderController = require("../controller/orderController");

router.post("/create", orderController.placeOrder);
router.patch("/:id", orderController.updateOrderStatus);
//router.get("/:id", orderController.getOrderDetails);
router.get("/", orderController.getAllOrders);

module.exports = router;
