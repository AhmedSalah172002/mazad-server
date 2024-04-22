const mongoose = require("mongoose");

// 1- Create Schema
const ReviewSchema = new mongoose.Schema(
   {
      user: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
      },
      // trader
      merchant: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
      },
      message: {
         type: String,
         required: true,
      },
      upVotes: {
         type: [
            {
               type: mongoose.Schema.Types.ObjectId,
               ref: "User",
            },
         ],
      },
      downVotes: {
         type: [
            {
               type: mongoose.Schema.Types.ObjectId,
               ref: "User",
            },
         ],
      },
   },
   {
      timestamps: true,
   }
);

const Review = mongoose.model("Review", ReviewSchema);

module.exports = {
   Review,
};
