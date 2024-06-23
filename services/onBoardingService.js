const stripe = require("stripe")(process.env.STRIPE_SECRET);
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");

exports.OnboardingAccount = asyncHandler(async (req, res, next) => {
   const userId = req.user.id;
   try {
      const user = await User.findById(userId);

      if (!user.stripe_account_id) {
         const account = await createStripeAccount(user);
         if (account) {
            user.stripe_account_id = account.id;
            user.stripe_default_currency = account.default_currency;
            user.stripe_account_type = account.type;
            await user.save();
         }
      }
      

      if (user.stripe_account_id) {
         const onboardingLink = await stripe.accountLinks.create({
            account: user.stripe_account_id,
            refresh_url: `${process.env.FRONTEND_URL}/dashboard/products`,
            return_url: `${process.env.FRONTEND_URL}/dashboard/products`,
            type: "account_onboarding",
            collect: "eventually_due",
         });

         const account = await stripe.accounts.retrieve(user.stripe_account_id)
         user.stripe_charges_enabled = account.charges_enabled;
         user.stripe_payouts_enabled = account.payouts_enabled;
         await user.save();
         return res.status(200).json({ url: onboardingLink.url });
      } else {
         return res
            .status(404)
            .json({
               error: "Stripe account not found for the specified organization",
            });
      }
   } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: "Internal server error" });
   }
});



const createStripeAccount= async(user)=> {
    try {
        const account = await stripe.accounts.create({
            country: 'US',
            type: 'express',
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true }
            },
            business_type: 'individual',
            email: user.email,
            business_profile: {
                mcc: '7299',
                name: user.name,
                product_description: 'Mazady Service',
                support_email: user.email,
                url: `https://www.facebook.com/profile.php?id=61558504242252`
            }
        });
        return account;
    } catch (e) {
        console.log(e);
        throw new Error('An error occurred while creating the Stripe account');
    }
}