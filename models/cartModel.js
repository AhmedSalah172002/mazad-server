const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    },
    totalPrice: Number,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

cartSchema.pre(/^find/, function (next) {
  this.populate({ path: 'product', select: "_id name image " });
  next();
});


module.exports = mongoose.model('Cart', cartSchema);
