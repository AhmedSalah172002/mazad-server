const mongoose = require("mongoose");

// 1- Create Schema
const ReviewSchema = new mongoose.Schema(
   {
      user: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
      },
      merchant: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
      },
      rating: {
         type: Number,
      },
      speedOfCommunication: {
         // سرعه التواصل
         type: Number,
      },
      delivery: {
         // التوصيل
         type: Number,
      },
      credibility: {
         // المصداقية
         type: Number,
      },
      respect: {
         // الاحترام
         type: Number,
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
