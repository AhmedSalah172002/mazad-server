const express = require("express");
const { protect } = require("../services/authService");
const {
   createMerchantReview,
   getMerchantUserReviews,
   getOneReview,
   updateOneReview,
   deleteOneReview,
   voteUp,
   voteDown,
   deleteVote,
} = require("../services/reviewService");
const {
   createReviewValidator,
   getMerchantUserReviewsValidator,
   getOneReviewValidator,
   updateDeleteOneReviewValidator,
   voteValidator,
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
   .post(protect, setUserInBody, createReviewValidator, createMerchantReview)
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

router
   .route("/reviews/:id")
   .get(getOneReviewValidator, getOneReview)
   .put(protect, updateDeleteOneReviewValidator, updateOneReview)
   .delete(protect, updateDeleteOneReviewValidator, deleteOneReview);

router.put("/reviews/:id/voteUp", protect, voteValidator, voteUp);
router.put("/reviews/:id/voteDown", protect, voteValidator, voteDown);

router.delete("/reviews/:id/deleteVote", protect, deleteVote);

module.exports = router;
