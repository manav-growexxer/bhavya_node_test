const express = require("express");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

const PORT = 3000;
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

module.exports = app;
