const express = require("express");
const productController = require("./../controller/productController");

const router = express.Router();

router.patch(
  "/:id",
  productController.uploadProductPhoto,
  productController.updateProduct
);

router.post(
  "/",
  productController.uploadProductPhoto,
  productController.createProduct
);

router.get("/", productController.getProducts);

module.exports = router;
