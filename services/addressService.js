const asyncHandler = require("express-async-handler");

const User = require("../models/userModel");

// @desc    Add address to user addresses list
// @route   POST /api/v1/addresses
// @access  Protected/User
exports.addAddress = asyncHandler(async (req, res, next) => {
   const user = await User.findByIdAndUpdate(
      req.user._id,
      {
         $addToSet: { addresses: req.body },
      },
      { new: true }
   );

   if (user.addresses.length > 0 && user.image) {
      user.active = true;
   } else {
      updatedUser.active = false;
   }
   user.save();

   res.status(200).json({
      status: "success",
      message: "Address added successfully.",
      data: user.addresses,
   });
});

// @desc    Remove address from user addresses list
// @route   DELETE /api/v1/addresses/:addressId
// @access  Protected/User
exports.removeAddress = asyncHandler(async (req, res, next) => {
   const user = await User.findByIdAndUpdate(
      req.user._id,
      {
         $pull: { addresses: { _id: req.params.addressId } },
      },
      { new: true }
   );

   res.status(200).json({
      status: "success",
      message: "Address removed successfully.",
      data: user.addresses,
   });
});
// @desc    Update address in user addresses list
// @route   PUT /api/v1/addresses/:addressId
// @access  Protected/User
exports.updateAddress = asyncHandler(async (req, res, next) => {
   const { alias, details, phone, city } = req.body;

   // Create the update object with only the fields that are present in req.body
   const updateFields = {};
   if (alias) updateFields["addresses.$.alias"] = alias;
   if (details) updateFields["addresses.$.details"] = details;
   if (phone) updateFields["addresses.$.phone"] = phone;
   if (city) updateFields["addresses.$.city"] = city;

   const user = await User.findOneAndUpdate(
      {
         _id: req.user._id,
         "addresses._id": req.params.addressId,
      },
      { $set: updateFields },
      { new: true }
   );

   res.status(200).json({
      status: "success",
      message: "Address updated successfully.",
      data: user.addresses,
   });
});

// @desc    Get specific address in user addresses list
// @route   get /api/v1/addresses/:addressId
// @access  Protected/User
exports.getSpecificAddress = asyncHandler(async (req, res, next) => {
   const user = await User.findById(req.user._id);

   const Adress = user.addresses.filter(
      (e) => e._id.toString() === req.params.addressId.toString()
   );

   res.status(200).json({
      status: "success",
      data: Adress,
   });
});

// @desc    Get logged user addresses list
// @route   GET /api/v1/addresses
// @access  Protected/User
exports.getLoggedUserAddresses = asyncHandler(async (req, res, next) => {
   const user = await User.findById(req.user._id).populate("addresses");

   res.status(200).json({
      status: "success",
      results: user.addresses.length,
      data: user.addresses,
   });
});
