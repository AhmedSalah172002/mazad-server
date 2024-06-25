const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

const { Product } = require("../models/productModel");
const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

const sendEmail = async (options) => {
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: `${process.env.COMPANY_NAME}`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  });
};

const generateWinningMessage = (userName, productName) => {
  return `Hi ${userName},\nCongratulations! You won the auction for the product ${productName}.`;
};

const generateWinningHtmlMessage = (userName, productName, frontendUrl, companyName, cartId) => {
  return `
    <h1>Hi ${userName},</h1>
    <p>You won the auction for the product <strong>${productName}</strong>.</p>
    <p>Please complete payment within 3 days.</p>
    <p>Use this link: <a href="${frontendUrl}/user/payments/${cartId}">${frontendUrl}/user/payments/${cartId}</a></p>
    <br/>
    <p>Best regards,</p>
    <h3>The ${companyName} Team</h3>
  `;
};

const notifyLosers = async (users, product) => {
  for (const userId of users) {
    const user = await User.findById(userId);
    if (user) {
      const message = `Hi ${user.name},\nYou lost the auction for the product ${product.name}.`;
      const htmlMessage = `
        <h1>Hi ${user.name},</h1>
        <p>You lost the auction for the product <strong>${product.name}</strong>.</p>
        <p>Your money will be refunded to you within the next hour.</p>
        <p>We hope you have better luck next time.</p>
        <br/>
        <p>Best regards,</p>
        <h3>The ${process.env.COMPANY_NAME} Team</h3>
      `;
      await sendEmail({
        email: user.email,
        subject: "You lost the auction.",
        message: message,
        html: htmlMessage,
      });
    }
  }
};

const addProductToUserCart = async (user, product) => {
  const foundCart = await Cart.findOne({ product: product._id, user: user._id });

  if (!foundCart && product.mazad.length >= 1) {
    const totalPrice = (product.mazad[product.mazad.length - 1].price - (product.initialPrice * 0.05)).toFixed(2);
    const newCart = await Cart.create({
      user: user._id,
      totalPrice: totalPrice,
      product: product._id,
    });
    return newCart;
  }
  return foundCart;
};

// @desc    Add product to cart
// @route   POST /api/v1/cart
// @access  Private/User
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, userId } = req.body;
  const product = await Product.findById(productId);
  const user = await User.findById(userId);

  if (!product || !user) {
    return next(new ApiError("Product or User not found", 404));
  }

  const users = product.involved
    .filter(bid => bid.user.toString() !== userId.toString())
    .map(bid => bid.user.toString());

  await notifyLosers(users, product);
  const cartData = await addProductToUserCart(user, product);

  await sendEmail({
    email: user.email,
    subject: "You won the auction.",
    message: generateWinningMessage(user.name, product.name),
    html: generateWinningHtmlMessage(user.name, product.name, process.env.FRONTEND_URL, process.env.COMPANY_NAME, cartData._id),
  });

  res.status(201).json({
    status: "success",
    message: "Product added to cart successfully",
  });
});

// @desc    Get logged user cart
// @route   GET /api/v1/cart
// @access  Private/User
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(new ApiError(`There is no cart for this user id: ${req.user._id}`, 404));
  }

  res.status(200).json({
    status: "success",
    data: cart,
  });
});
