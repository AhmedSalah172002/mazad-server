const mongoose = require("mongoose");

// 1- Create Schema
const productSchema = new mongoose.Schema(
   {
      name: {
         type: String,
         required: [true, "Product required"],
         minlength: [3, "Too short Product name"],
         maxlength: [32, "Too long Product name"],
      },
      slug: {
         type: String,
         required: true,
         lowercase: true,
      },
      image: {
         type: String,
         require: [true, "Product image is required"],
      },
      images: {
         type: [
            {
               type: String,
            },
         ],
         validate: [
            (val) => val.length <= 5,
            "Exceeded maximum number of images allowed (5)",
         ],
      },
      description: {
         type: String,
         required: [true, "Product description is required"],
      },
      initialPrice: {
         type: Number,
         required: [true, "Product initialPrice is required"],
      },
      lowestBidValue: {
         type: Number,
         required: [true, "Product lowestBidValue is required"],
      },
      status: {
         type: String,
         default: "not-started",
         enum: ["not-started", "start-now", "finished"],
      },
      user: {
         type: mongoose.Schema.ObjectId,
         ref: "User",
         required: [true, "Product must belong to user"],
      },
      mazad: [
         {
            id: { type: mongoose.Schema.Types.ObjectId },
            user: {
               type: mongoose.Schema.ObjectId,
               ref: "User",
            },
            price: Number,
         },
      ],
      category: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Category",
         required: [true, "Product must belong to a category"],
      },
      date: {
         type: Date,
         required: [true, "Date is required"],
      },
      startTime: {
         type: String,
         required: [true, "Start time is required"],
      },
      endTime: {
         type: String,
         required: [true, "End time is required"],
      },
   },
   {
      timestamps: true,
   }
);

productSchema.pre(/^find/, function (next) {
   this.populate({
      path: "user",
      select: "name email phone role addresses",
   });
   this.populate({
      path: "category",
      select: "name image",
   });
   this.populate({ path: "mazad.user" });
   next();
});

const Product = mongoose.model("Product", productSchema);
// 2- Create model
module.exports = {
   Product,
};
