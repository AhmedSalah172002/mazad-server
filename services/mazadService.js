const asyncHandler = require("express-async-handler");

const { Product } = require("../models/productModel");

// @desc    Add mazad to product mazad list
// @route   POST /api/v1/mazad/:id
// @access  Protected/User
exports.addMazad = asyncHandler(async (req, res, next) => {
   const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
         $addToSet: { mazad: { price: req.body.price, user: req.user._id } },
      },
      { new: true }
   );

   res.status(200).json({
      status: "success",
      message: "Mazad added successfully.",
      data: product.mazad,
   });
});
