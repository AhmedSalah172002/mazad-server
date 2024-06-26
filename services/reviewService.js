const { Review } = require("../models/reviewModel");
const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");
const User = require("../models/userModel");

const getMerchantAverageReviews = (reviews) => {
   const average = {
      rating: 0,
      speedOfCommunication: 0,
      delivery: 0,
      credibility: 0,
      respect: 0,
   };

   if (reviews.length === 0) return average;

   reviews.forEach((review) => {
      average.speedOfCommunication += review.speedOfCommunication;
      average.delivery += review.delivery;
      average.credibility += review.credibility;
      average.respect += review.respect;
   });

   const count = reviews.length;
   average.speedOfCommunication /= count;
   average.delivery /= count;
   average.credibility /= count;
   average.respect /= count;
   average.rating =
      (average.speedOfCommunication +
         average.delivery +
         average.credibility +
         average.respect) /
      4;

   average.speedOfCommunication = average.speedOfCommunication.toFixed(2);
   average.delivery = average.delivery.toFixed(2);
   average.credibility = average.credibility.toFixed(2);
   average.respect = average.respect.toFixed(2);
   average.rating = average.rating.toFixed(2);

   return average;
};

const calculateRating = (req, res, next) => {
   let rating = 0;
   const fields = [
      "speedOfCommunication",
      "delivery",
      "credibility",
      "respect",
   ];
   for (const item in req.body) {
      if (fields.includes(item)) {
         rating += +req.body[item];
      }
   }
   req.body.rating = rating / 4;
   next();
};

const createMerchantReview = asyncHandler(async (req, res, next) => {
   const existReview = await Review.findOne({
      user: req.user._id.toString(),
      merchant: req.params.id,
   });
   if (existReview) {
      return res.status(400).json({
         error: "You can only review a merchant once.",
      });
   }
   const review = await Review.create({
      ...req.body,
      user: req.user._id,
      merchant: req.params.id,
   });

   return res.status(201).json(review);
});

const getMerchantUserReviews = factory.getAll(Review, "Review");

const getOneReview = factory.getOne(Review, "Review");

const deleteOneReview = factory.deleteOne(Review, "Review");

const deleteUserReview = asyncHandler(async (req, res, next) => {
   const { id: merchantId } = req.params;
   const review = await Review.findOneAndDelete({
      user: req.user._id,
      merchant: merchantId,
   });
   if (!review) {
      return res.status(404).json({ error: "No doc match this id" });
   }
   return res.status(204).send();
});

const getMerchantReviews = asyncHandler(async (req, res, next) => {
   const { id: merchantId } = req.params;
   const merchant = await User.findById(merchantId);
   const reviews = await Review.find({ merchant: merchantId }).populate({
      path: "user",
      select: "name email image",
   });
   const averageReviews = getMerchantAverageReviews(reviews);
   const response = {
      merchant,
      reviews,
      averageReviews,
   };
   return res.status(200).json(response);
});

module.exports = {
   getMerchantAverageReviews,
   calculateRating,
   createMerchantReview,
   getMerchantUserReviews,
   getOneReview,
   deleteOneReview,
   deleteUserReview,
   getMerchantReviews,
};
