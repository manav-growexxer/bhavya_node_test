const Order = require("./../model/orderModel");
const Product = require("./../model/productModel");
const nodemailer = require("nodemailer");
const sendEmail = require("./../utils/email");

exports.placeOrder = async (req, res) => {
  try {
    const { customerName, customerEmail, products } = req.body;

    let totalPrice = 0;
    const orderedProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          status: "fail",
          message: `Product with ID ${item.productId} not found`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          status: "fail",
          message: `Not enough stock for product ${product.name}`,
        });
      }

      totalPrice += product.price * item.quantity;

      product.stock -= item.quantity;

      await product.save();

      orderedProducts.push({
        productId: product._id,
        quantity: item.quantity,
        productName: product.name,
        productPrice: product.price,
      });
    }

    const newOrder = new Order({
      customerName,
      customerEmail,
      products: orderedProducts,
      totalPrice,
      status: "Pending",
    });

    await newOrder.save();

    const message = `Dear ${customerName} , Your order have been successfully placed`;

    await sendEmail({
      email: customerEmail,
      subject: "Your password reset token (valid for 10 minutes)",
      message,
    });

    res.status(201).json({
      status: "success",
      message: "Order placed successfully",
      data: newOrder,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Order placement failed",
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ["Pending", "Shipped", "Delivered"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: "fail",
        message:
          'Invalid status. Status must be one of "Pending", "Shipped", or "Delivered".',
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        status: "fail",
        message: "Order not found",
      });
    }

    order.status = status;

    await order.save();

    res.status(200).json({
      status: "success",
      message: "Order status updated successfully",
      data: order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "fail",
      message: "Server error",
    });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "products.productId"
    );

    if (!order) {
      return res.status(404).json({
        status: "fail",
        message: "Order not found",
      });
    }

    let totalPrice = 0;
    order.products.forEach((item) => {
      totalPrice += item.productId.price * item.quantity;
    });

    res.status(200).json({
      status: "success",
      data: { order, totalPrice },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "fail",
      message: "Server error",
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    const orders = await Order.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const totalOrders = await Order.countDocuments(filter);

    const totalPages = Math.ceil(totalOrders / limit);

    res.status(200).json({
      status: "success",
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages,
          totalOrders,
          limit: Number(limit),
        },
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
