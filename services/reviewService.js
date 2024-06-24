const { Review } = require("../models/reviewModel");
const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");

exports.calculateRating = (req, res, next) => {
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
   next()
};

exports.createMerchantReview = asyncHandler(async (req, res, next) => {
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

exports.getMerchantUserReviews = factory.getAll(Review, "Review");

exports.getOneReview = factory.getOne(Review, "Review");

exports.updateOneReview = factory.updateOne(Review, "Review");

exports.deleteOneReview = factory.deleteOne(Review, "Review");
