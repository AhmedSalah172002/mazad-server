const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const { Review } = require("../../models/reviewModel");
const ApiError = require("../apiError");

exports.createReviewValidator = [
  check("user")
    .notEmpty()
    .withMessage("user is required")
    .isMongoId()
    .withMessage("Enter a user id valid"),
  check("id")
    .notEmpty()
    .withMessage("merchant is required")
    .isMongoId()
    .withMessage("Enter a merchant id valid"),
  check("message").notEmpty().withMessage("message is required"),
  validatorMiddleware,
];

exports.getMerchantUserReviewsValidator = [
  check("id")
    .notEmpty()
    .withMessage("id is required")
    .isMongoId()
    .withMessage("Enter a valid id"),
  validatorMiddleware,
];

exports.getOneReviewValidator = [
  check("id")
    .notEmpty()
    .withMessage("id is required")
    .isMongoId()
    .withMessage("Enter a valid id"),
  validatorMiddleware,
];

exports.updateDeleteOneReviewValidator = [
  check("id")
    .notEmpty()
    .withMessage("id is required")
    .isMongoId()
    .withMessage("Enter a valid id")
    .custom(async (value, { req }) => {
      const reviewExist = await Review.findOne({
        _id: value,
        user: req.user._id.toString(),
      });
      if (!reviewExist) {
        throw new ApiError("this review not belongs to you", 403);
      }
      return true;
    }),
  validatorMiddleware,
];

exports.voteValidator = [
  check("id")
    .notEmpty()
    .withMessage("reviewId is required")
    .isMongoId()
    .withMessage("Enter a valid reviewId"),
  validatorMiddleware,
];
