const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');

const Product = require('../models/productModel');
const Cart = require('../models/cartModel');



// @desc    Add product to  cart
// @route   POST /api/v1/cart
// @access  Private/User
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const {productId ,userId} = req.body;
  const product = await Product.findById(productId);
let cart
  if(product.mazad.length >= 1 && product.status ==="finished"){
     cart = await Cart.create({
        user: userId,
        totalPrice: product.mazad[product.mazad.length-1].price ,
        product:productId,
      });
    
  }
  

  res.status(201).json({
    status: 'success',
    message: 'Product added to cart successfully',
  });
});

// @desc    Get logged user cart
// @route   GET /api/v1/cart
// @access  Private/User
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(
      new ApiError(`There is no cart for this user id : ${req.user._id}`, 404)
    );
  }

  res.status(200).json({
    status: 'success',
    data: cart,
  });
});



