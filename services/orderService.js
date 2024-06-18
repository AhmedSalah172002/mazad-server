const stripe = require("stripe")(process.env.STRIPE_SECRET);
const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const { Product } = require("../models/productModel");

exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
   if (req.user.role === "user") {
      req.filterObj = { user: req.user._id };
   }
   next();
});

// @desc    Get all orders
// @route   POST /api/v1/orders
// @access  Protected/User-Admin
exports.findAllOrders = factory.getAll(Order);

// @desc    Get all orders
// @route   POST /api/v1/orders
// @access  Protected/User-Admin
exports.findSpecificOrder = factory.getOne(Order);

// @desc    Get checkout session from stripe and send it as response
// @route   GET /api/v1/orders/checkout-session/cartId
// @access  Protected/User
exports.checkoutSession = asyncHandler(async (req, res, next) => {
   // app settings
   const taxPrice = 0;
   const shippingPrice = 0;

   // 1) Get cart depend on cartId
   const cart = await Cart.findById(req.params.cartId);
   if (!cart) {
      return next(
         new ApiError(`There is no such cart with id ${req.params.cartId}`, 404)
      );
   }

   const totalOrderPrice = cart.totalPrice + taxPrice + shippingPrice;

   // 3) Create stripe checkout session
   const session = await stripe.checkout.sessions.create({
      line_items: [
         {
            price_data: {
               currency: "egp",
               unit_amount: totalOrderPrice * 100,
               product_data: {
                  name: req.user.name,
               },
            },
            quantity: 1,
         },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/my-orders`,
      cancel_url: `${process.env.FRONTEND_URL}`,
      customer_email: req.user.email,
      client_reference_id: req.params.cartId,
      metadata: req.body.shippingAddress,
   });

   // 4) send session to response
   res.status(200).json({ status: "success", session });
});

const involveClientToMazad = async(data)=>{
   const product = await Product.findByIdAndUpdate(
      data.product,
      {
         $addToSet: { involved: { user: data.user } },
      },
      { new: true }
   );

}


const createCardOrder = async (session) => {
   const shippingAddress = session.metadata;

   const cartId = session.client_reference_id;
   const orderPrice = session.amount_total / 100;

   const cart = await Cart.findById(cartId);
   const user = await User.findOne({ email: session.customer_email });

   // 3) Create order with default paymentMethodType card
   const order = await Order.create({
      user: user._id,
      product: cart.product,
      shippingAddress,
      totalOrderPrice: orderPrice,
      isPaid: true,
      paidAt: Date.now(),
   });

   if (order) {
      // 4) Clear cart depend on cartId
      await Cart.findByIdAndDelete(cartId);
   }
};

// @desc    This webhook will run when stripe payment success paid
// @route   POST /webhook-checkout
// @access  Protected/User
exports.webhookCheckout = asyncHandler(async (req, res, next) => {
   const sig = req.headers["stripe-signature"];

   let event;

   try {
      event = stripe.webhooks.constructEvent(
         req.body,
         sig,
         process.env.STRIPE_WEBHOOK_SECRET
      );
   } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
   }
   if (event.type === "checkout.session.completed") {
      if (event.data.object.metadata.hasOwnProperty("type")) {
         //  Create order
         involveClientToMazad(event.data.object.metadata);
      } else {
         //  Create order
         createCardOrder(event.data.object);
      }
   }

   res.status(200).json({ received: true });
});

exports.InsurancePayment = asyncHandler(async (req, res, next) => {
   const product = await Product.findById(req.params.productId);
   if (!product) {
      return next(
         new ApiError(
            `There is no such product with id ${req.params.productId}`,
            404
         )
      );
   }

   const totalOrderPrice = product.initialPrice * 0.05;

   // 3) Create stripe checkout session
   const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
         {
            price_data: {
               currency: "egp",
               unit_amount: totalOrderPrice * 100,
               product_data: {
                  name: product.name,
                  description: product.description,
               },
            },
            quantity: 1,
         },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/user/mazad/${req.params.productId}`,
      cancel_url: `${process.env.FRONTEND_URL}/product/${req.params.productId}`,
      customer_email: req.user.email,
      client_reference_id: req.params.productId,
      metadata: {
         type: "InsurancePayment",
         user: req.user.id,
         product: req.params.productId,
      },
   });

   // 4) send session to response
   res.status(200).json({ status: "success", session });
});
