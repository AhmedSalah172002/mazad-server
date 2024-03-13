const crypto = require('crypto');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const createToken = require('../utils/createToken');

const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail');


// @desc    Signup
// @route   GET /api/v1/auth/signup
// @access  Public
exports.signup = asyncHandler(async (req, res, next) => {

    const user=await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        phone:req.body.phone,
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

    if (currentUser.passwordChangedAt) {
        const passChangedTimestamp = parseInt(
          currentUser.passwordChangedAt.getTime() / 1000,
          10
        );
        if (passChangedTimestamp > decoded.iat) {
          return next(
            new ApiError(
              'User recently changed his password. please login again..',
              401
            )
          );
        }
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

  exports.forgotPassword = asyncHandler(async (req, res, next) => {

    const user=await User.findOne({email: req.body.email});

    if(!user) {
        return next(new ApiError("هذا الايميل غير موجود",404))
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(resetCode)
    .digest('hex');

    user.passwordResetCode = hashedResetCode;

    // Add expiration time for password reset code (1 min)
    user.passwordResetExpires = Date.now() + 1 * 60 * 1000;
    user.passwordResetVerified = false;

    await user.save();

    const message = `Hi ${user.name},\n We received a request to reset the password on your
     ${process.env.COMPANY_NAME} Account. \n `
    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset code (valid for 1 min)',
        message,
        resetCode:resetCode
      });
    } catch (err) {
      user.passwordResetCode = undefined;
      user.passwordResetExpires = undefined;
      user.passwordResetVerified = undefined;
  
      await user.save();
      return next(new ApiError('There is an error in sending email', 500));
    }
  
    res
      .status(200)
      .json({ status: 'Success', message: 'Reset code sent to email' });
    
  })

  // @desc    Verify password reset code
// @route   POST /api/v1/auth/verifyResetCode
// @access  Public
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
    // 1) Get user based on reset code
    const hashedResetCode = crypto
      .createHash('sha256')
      .update(req.body.resetCode)
      .digest('hex');
  
    const user = await User.findOne({
      passwordResetCode: hashedResetCode,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      return next(new ApiError('Reset code invalid or expired'));
    }
  
    // 2) Reset code valid
    user.passwordResetVerified = true;
    await user.save();
  
    res.status(200).json({
      status: 'Success',
    });
  });
  
  // @desc    Reset password
  // @route   POST /api/v1/auth/resetPassword
  // @access  Public
  exports.resetPassword = asyncHandler(async (req, res, next) => {
    // 1) Get user based on email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(
        new ApiError(`There is no user with email ${req.body.email}`, 404)
      );
    }
  
    // 2) Check if reset code verified
    if (!user.passwordResetVerified) {
      return next(new ApiError('Reset code not verified', 400));
    }
  
    user.password = req.body.newPassword;
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;
  
    await user.save();
  
    // 3) if everything is ok, generate token
    const token = createToken(user._id);
    res.status(200).json({ token });
  });
  


