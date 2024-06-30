const express = require("express");
const {
   findAllOrders,
   findSpecificOrder,
   filterOrderForLoggedUser,
   checkoutSession,
   InsurancePayment,
   getMerchantOrders,
} = require("../services/orderService");

const authService = require("../services/authService");

const router = express.Router();


router.get(
   "/orders/checkout-session/:cartId",
   authService.protect,
   authService.allowedTo("user"),
   checkoutSession
);
router.get(
   "/orders/insurance-payment/:productId",
   authService.protect,
   authService.allowedTo("user"),
   InsurancePayment
);
router.get(
   "/user/orders",
   authService.protect,
   authService.allowedTo("user"),
   filterOrderForLoggedUser,
   findAllOrders
);
router.get("/orders/:id", authService.protect, findSpecificOrder);

// for admins
router.get("/admin/orders", authService.protect, authService.allowedTo("admin"), findAllOrders);

// for merchant
router.get(
   "/merchant/orders",
   authService.protect,
   authService.allowedTo("merchant"),
   getMerchantOrders
);

module.exports = router;
