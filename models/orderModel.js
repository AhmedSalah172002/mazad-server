const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
   {
      user: {
         type: mongoose.Schema.ObjectId,
         ref: "User",
         required: [true, "Order must be belong to user"],
      },
      product: {
         type: mongoose.Schema.ObjectId,
         ref: "Product",
      },
      totalPrice: Number,
      taxPrice: {
         type: Number,
         default: 0,
      },
      shippingAddress: {
         details: String,
         phone: String,
         city: String,
      },
      shippingPrice: {
         type: Number,
         default: 0,
      },
      totalOrderPrice: {
         type: Number,
      },
      isPaid: {
         type: Boolean,
         default: false,
      },
      paidAt: Date,
   },
   { timestamps: true }
);

orderSchema.pre(/^find/, function (next) {
   this.populate({
      path: "user",
      select: "name  email phone",
   }).populate({
      path: "product",
      select: "name image  ",
   });

   next();
});
module.exports = mongoose.model("Order", orderSchema);
