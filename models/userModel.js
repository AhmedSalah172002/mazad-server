const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
   {
      name: {
         type: String,
         trim: true,
         required: [true, "name required"],
      },
      slug: {
         type: String,
         lowercase: true,
      },
      email: {
         type: String,
         required: [true, "email required"],
         unique: true,
         lowercase: true,
      },
      phone: String,
      password: {
         type: String,
         required: [true, "password required"],
         minlength: [6, "Too short password"],
      },
      passwordChangedAt: Date,
      passwordResetCode: String,
      passwordResetExpires: Date,
      passwordResetVerified: Boolean,
      active: {
         type: Boolean,
         default: false,
      },
      wishlist: [
         {
            type: mongoose.Schema.ObjectId,
            ref: "Product",
         },
      ],
      role: {
         type: String,
         enum: ["user", "merchant", "admin"],
         default: "user",
      },
      addresses: [
         {
            id: { type: mongoose.Schema.Types.ObjectId },
            alias: String,
            details: String,
            phone: String,
            city: String,
         },
      ],
      image: {
         type: String,
      },
      stripe_account_id: String,
      stripe_default_currency: String,
      stripe_account_type: String,
      stripe_charges_enabled:{
         type: Boolean,
         default: false,
      }, 
      stripe_payouts_enabled:{
         type: Boolean,
         default: false,
      }, 
   },
   { timestamps: true }
);

userSchema.pre("save", async function (next) {
   if (!this.isModified("password")) return next();
   this.password = await bcrypt.hash(this.password, 12);
   next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
