const express = require("express");
const { protect } = require("../services/authService");
const {
   createMerchantReview,
   getMerchantUserReviews,
   getOneReview,
   updateOneReview,
   deleteOneReview,
   calculateRating,
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

router.get(
   "/user/:id/reviews",
   getMerchantUserReviewsValidator,
   filterByUser,
   getMerchantUserReviews
);


module.exports = router;
