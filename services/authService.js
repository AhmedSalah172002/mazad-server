const crypto = require('crypto');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const createToken = require('../utils/createToken');

const User = require('../models/userModel');


// @desc    Signup
// @route   GET /api/v1/auth/signup
// @access  Public
exports.signup = asyncHandler(async (req, res, next) => {

    const user=await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        phone:req.body.phone,
        role:req.body.role,
    });

    const token=createToken(user._id);

    res.status(201).json({data: user , token});

})


// @desc    Login
// @route   GET /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {

    const user=await User.findOne({ email : req.body.email});

    if(!user || !(await bcrypt.compare(req.body.password, user.password)))
    return next(new ApiError('الايميل او الباسورد غير صحيح', 401));

    const token = createToken(user._id);
    res.status(201).json({ data: user, token });
})


exports.protect=asyncHandler(async (req, res, next)=>{
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return next(
        new ApiError(
          'You are not login, Please login to get access this route',
          401
        )
      );
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return next(
        new ApiError(
          'The user that belong to this token does no longer exist',
          401
        )
      );
    }


    req.user = currentUser;
    next();
})

// @desc    Authorization (User Permissions)
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError('You are not allowed to access this route', 403)
      );
    }
    next();
  });

 