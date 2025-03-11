const Product = require("./../model/productModel");
const multer = require("multer");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/image/users");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(
      null,
      `product-${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`
    );
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(
      res.status(400).json({
        status: "failed",
        message: "Not an image please upload only images",
      })
    );
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadProductPhoto = upload.array("images", 5);

exports.createProduct = async (req, res) => {
  try {
    const newProduct = await Product.create({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
    });

    if (req.files) {
      const imagePaths = req.files.map(
        (file) => `/img/products/${file.filename}`
      );
      newProduct.images = imagePaths;

      await newProduct.save();
    }

    res.status(201).json({
      status: "success",
      message: "The product has been created",
      data: newProduct,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "failed",
      message: "Product creation failed",
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
    }

    const updatedData = {
      name: req.body.name || product.name,
      description: req.body.description || product.description,
      price: req.body.price || product.price,
      category: req.body.category || product.category,
    };

    if (req.files && req.files.length > 0) {
      const imagePaths = req.files.map(
        (file) => `/img/products/${file.filename}`
      );
      updatedData.images = imagePaths;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "fail",
      message: "Product update failed",
    });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const {
      category,
      page = 1,
      limit = 10,
      sort = "price",
      order = "asc",
    } = req.query;

    const filter = {};
    if (category) {
      filter.category = category;
    }

    const paginationOptions = {
      page: parseInt(page),
      limit: parseInt(limit),
    };

    const sortOptions = {};
    if (sort && order) {
      sortOptions[sort] = order === "desc" ? -1 : 1;
    }

    const products = await Product.find(filter)
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .limit(paginationOptions.limit)
      .sort(sortOptions);

    const totalProducts = await Product.countDocuments(filter);

    res.status(200).json({
      status: "success",
      data: {
        products,
        totalProducts,
        totalPages: Math.ceil(totalProducts / paginationOptions.limit),
        currentPage: paginationOptions.page,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "fail",
      message: "Server error",
    });
  }
};
