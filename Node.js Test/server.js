const mongoose = require("mongoose");
const app = require("./app");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
