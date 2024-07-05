const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

const factory = require("./handlersFactory");
const ApiError = require("../utils/apiError");
const createToken = require("../utils/createToken");
const User = require("../models/userModel");
const { updateAddress } = require("./addressService");

// @desc    Get list of users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = factory.getAll(User);

// @desc    Get specific user by id
// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getUser = factory.getOne(User);

// @desc    Create user
// @route   POST  /api/v1/users
// @access  Private/Admin

exports.createUser = factory.createOne(User);

// @desc    Update specific user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
   const document = await User.findByIdAndUpdate(
      req.params.id,
      {
         name: req.body.name,
         slug: req.body.slug,
         phone: req.body.phone,
         email: req.body.email,
         role: req.body.role,
      },
      {
         new: true,
      }
   );

   if (!document) {
      return next(
         new ApiError(`No document for this id ${req.params.id}`, 404)
      );
   }
   res.status(200).json({ data: document });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
   const document = await User.findByIdAndUpdate(
      req.params.id,
      {
         password: await bcrypt.hash(req.body.password, 12),
         passwordChangedAt: Date.now(),
      },
      {
         new: true,
      }
   );

   if (!document) {
      return next(
         new ApiError(`No document for this id ${req.params.id}`, 404)
      );
   }
   res.status(200).json({ data: document });
});

// @desc    Delete specific user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = factory.deleteOne(User);

// @desc    Get Logged user data
// @route   GET /api/v1/users/getMe
// @access  Private/Protect
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
   req.params.id = req.user._id;
   next();
});

// @desc    Update logged user password
// @route   PUT /api/v1/users/updateMyPassword
// @access  Private/Protect
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
   // 1) Update user password based user payload (req.user._id)
   const user = await User.findByIdAndUpdate(
      req.user._id,
      {
         password: await bcrypt.hash(req.body.password, 12),
         passwordChangedAt: Date.now(),
      },
      {
         new: true,
      }
   );

   // 2) Generate token
   const token = createToken(user._id);

   res.status(200).json({ data: user, token });
});

// @desc    Update logged user data (without password, role)
// @route   PUT /api/v1/users/updateMe
// @access  Private/Protect
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
   const updatedData = {
      ...req.body,
   };
   // execute password, role and active
   const executedField = ["password", "role", "active"];
   for (const key in updatedData) {
      if (executedField.includes(key)) {
         delete updatedData[key];
      }
   }
   const updatedUser = await User.findByIdAndUpdate(req.user._id, updatedData, {
      new: true,
   });

   if (updatedUser.addresses.length > 0 && updatedUser.image) {
      updatedUser.active = true;
   } else {
      updatedUser.active = false;
   }
   updatedUser.save();

   res.status(200).json(updatedUser);
});

// @desc    Deactivate logged user
// @route   DELETE /api/v1/users/deleteMe
// @access  Private/Protect
exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
   await User.findByIdAndDelete(req.user._id);
   res.status(204).json({ status: "Success" });
});



exports.getAllMerchants = asyncHandler(async(req, res, next) => {
   const merchants = await User.find({role: 'merchant'})
   return res.status(200).json(merchants)
})