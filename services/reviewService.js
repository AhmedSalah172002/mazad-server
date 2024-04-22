const { Review } = require("../models/reviewModel");
const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");

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

exports.voteUp = asyncHandler(async (req, res, next) => {
   // get review
   const review = await Review.findById(req.params.id);
   if (!review) {
      return res.status(404).json({
         error: "No review match this id",
      });
   }

   // Check if the user has voted before
   const userId = req.user._id;
   const hasVotedBefore = review.upVotes.some(
      (id) => id.toString() === userId.toString()
   );

   if (hasVotedBefore) {
      return res.status(400).json({
         error: "You have already voted up on this review",
      });
   }

   // Add user to upVotes array
   review.upVotes.push({ _id: userId });

   // Remove user from downVotes array if they have previously voted down
   const downVoteIndex = review.downVotes.findIndex(
      (id) => id.toString() === userId.toString()
   );
   if (downVoteIndex !== -1) {
      review.downVotes.splice(downVoteIndex, 1);
   }

   await review.save();

   res.status(200).json({
      review: review,
   });
});

exports.voteDown = asyncHandler(async (req, res, next) => {
   // Get review
   const review = await Review.findById(req.params.id);

   if (!review) {
      return res.status(404).json({
         error: "No review matches this ID",
      });
   }

   // Check if the user has voted before
   const userId = req.user._id;
   const hasVotedBefore = review.downVotes.some(
      (id) => id.toString() === userId.toString()
   );

   if (hasVotedBefore) {
      return res.status(400).json({
         error: "You have already voted down on this review",
      });
   }

   // Add user to downVotes array
   review.downVotes.push({ _id: userId });

   // Remove user from upVotes array if they have previously voted up
   const upVoteIndex = review.upVotes.findIndex(
      (id) => id.toString() === userId.toString()
   );
   if (upVoteIndex !== -1) {
      review.upVotes.splice(upVoteIndex, 1);
   }

   await review.save();

   res.status(200).json({
      review: review,
   });
});

exports.deleteVote = asyncHandler(async (req, res, next) => {
   const userId = req.user._id;

   const review = await Review.findById(req.params.id);
   if (!review) {
      return res.status(404).json({
         error: "No review match this id",
      });
   }

   const hasVotedBefore =
      review.upVotes.some((id) => id.toString() === userId.toString()) ||
      review.downVotes.some((id) => id.toString() === userId.toString());

   if (!hasVotedBefore) {
      return res.status(404).json({
         error: "You haven't voted on this review before",
      });
   }

   // Remove user from upVotes array if they have previously voted up
   const upVoteIndex = review.upVotes.findIndex(
      (id) => id.toString() === userId.toString()
   );
   if (upVoteIndex !== -1) {
      review.upVotes.splice(upVoteIndex, 1);
   }

   // Remove user from downVotes array if they have previously voted down
   const downVoteIndex = review.downVotes.findIndex(
      (id) => id.toString() === userId.toString()
   );
   if (downVoteIndex !== -1) {
      review.downVotes.splice(downVoteIndex, 1);
   }

   await review.save();

   res.status(200).json({
      review: review,
   });
});
