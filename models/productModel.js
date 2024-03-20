const mongoose = require("mongoose");

// 1- Create Schema
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product required"],
      unique: [true, "Product must be unique"],
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
    description: {
      type: String,
      required: [true, "Product description is required"],
      minlength: [10, "Too short product description"],
    },
    InitialPrice: {
      type: Number,
      required: [true, "Product InitialPrice is required"],
    },
    LowestBidValue: {
      type: Number,
      required: [true, "Product LowestBidValue is required"],
    },
    BiddingStartTime: {
      type: Date,
      required: [true, "Product BiddingStartTime is required"],
    },
    BiddingEndTime: {
      type: Date,
      required: [true, "Product BiddingEndTime is required"],
    },
    status: {
      type: String,
      default: "not-started",
      enum: ["not-started", "start-now", "finished"],
    },
    Merchant: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Product must belong to Merchant"],
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

const setImageURL = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/products/${doc.image}`;
    doc.image = imageUrl;
  }
};
// findOne, findAll and update
productSchema.post("init", (doc) => {
  setImageURL(doc);
});

// create
productSchema.post("save", (doc) => {
  setImageURL(doc);
});

productSchema.pre(/^find/, function (next) {
  this.populate({
    path: "Merchant",
    select: "name email phone role addresses",
  });
  this.populate({ path: "mazad.user" });
  next();
});

// 2- Create model
module.exports = mongoose.model("Product", productSchema);
