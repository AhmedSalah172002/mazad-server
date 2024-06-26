const express = require("express");
const { protect, allowedTo } = require("../services/authService");
const {
   createMerchantReview,
   getMerchantUserReviews,
   getOneReview,
   deleteOneReview,
   calculateRating,
   deleteUserReview,
   getMerchantReviews,
} = require("../services/reviewService");
const {
   createReviewValidator,
   getMerchantUserReviewsValidator,
   getOneReviewValidator,
   updateDeleteOneReviewValidator,
} = require("../utils/validators/reviewValidator");
const { setUserInBody } = require("./productRoute");
const router = express.Router();

const filterByMerchant = (req, res, next) => {
   req.filterObj = {
      merchant: req.params.id,
   };
   next();
};

const filterByUser = (req, res, next) => {
   req.filterObj = {
      user: req.params.id,
   };
   next();
};

router
   .route("/merchant/:id/reviews")
   .post(protect, setUserInBody, createReviewValidator, calculateRating, createMerchantReview)
   .get(
      getMerchantUserReviewsValidator,
      filterByMerchant,
      getMerchantUserReviews
   );

router.delete("/merchant/:id/user/review", protect, setUserInBody, deleteUserReview)

router.get(
   "/user/:id/reviews",
   getMerchantUserReviewsValidator,
   filterByUser,
   getMerchantUserReviews
);

router
   .route("/reviews/:id")
   .get(getOneReviewValidator, getOneReview)
   .delete(protect, allowedTo('admin', 'user'), updateDeleteOneReviewValidator, deleteOneReview);

router.get('/admin/merchant/:id/reviews', protect, allowedTo('merchant', 'admin'), getMerchantReviews)

module.exports = router;
