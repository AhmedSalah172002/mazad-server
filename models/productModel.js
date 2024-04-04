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
      minlength: [10, "Too short product description"],
    },
    initialPrice: {
      type: Number,
      required: [true, "Product initialPrice is required"],
    },
    lowestBidValue: {
      type: Number,
      required: [true, "Product lowestBidValue is required"],
    },
    biddingStartDate: {
      type: Date,
      required: [true, "Product biddingStartDate is required"],
    },
    biddingEndDate: {
      type: Date,
      required: [true, "Product biddingEndDate is required"],
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
  },
  {
    timestamps: true,
  }
);

const setImageURL = (doc, dirName) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/${dirName}/${doc.image}`;
    doc.image = imageUrl;
  }
};
// // findOne, findAll and update
// productSchema.post("init", (doc) => {
//   setImageURL(doc, 'products');
// });

// // create
// productSchema.post("save", (doc) => {
//   setImageURL(doc, 'products');
// });

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
  setImageURL,
};
