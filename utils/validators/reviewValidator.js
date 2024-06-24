const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const { Review } = require("../../models/reviewModel");
const ApiError = require("../apiError");

const validateField = (fieldName) => {
   return check(fieldName)
      .notEmpty()
      .withMessage(`${fieldName} is required`)
      .custom((value) => {
         if (Number.isNaN(+value)) {
            throw new ApiError(`${fieldName} value must be number`, 400);
         } else if (+value < 1 || +value > 5) {
            throw new ApiError(
               `${fieldName} value must be between 1 to 5`,
               400
            );
         }
         return true;
      });
};


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
   validateField("speedOfCommunication"),
   validateField("delivery"),
   validateField("credibility"),
   validateField("respect"),
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
         if(req.user.role=='admin') return true
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
