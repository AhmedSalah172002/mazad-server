const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

const { Product } = require("../models/productModel");
const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");

// @desc    Add product to  cart
// @route   POST /api/v1/cart
// @access  Private/User
exports.addProductToCart = asyncHandler(async (req, res, next) => {
   const { productId, userId } = req.body;
   const product = await Product.findById(productId);
   const user = await User.findById(userId);
   let cart;
   if (product.mazad.length >= 1) {
      cart = await Cart.create({
         user: userId,
         totalPrice: product.mazad[product.mazad.length - 1].price,
         product: productId,
      });

      const message = `Hi ${user.name},\n We received a request to reset the password on your
      ${process.env.COMPANY_NAME} Account. \n `;
      try {
         await sendEmail({
            email: user.email,
            subject: "Your password reset code (valid for 10 minutes)",
            message,
            resetCode: 'resetCode',
         });
      } catch (err) {
         console.log(err);
         return next(new ApiError("There is an error in sending email", 500));
      }
   }

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
      return next(
         new ApiError(
            `There is no cart for this user id : ${req.user._id}`,
            404
         )
      );
   }

   res.status(200).json({
      status: "success",
      data: cart,
   });
});
