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

router.use(authService.protect);

router.get(
   "/orders/checkout-session/:cartId",
   authService.allowedTo("user"),
   checkoutSession
);
router.get(
   "/orders/insurance-payment/:productId",
   authService.allowedTo("user"),
   InsurancePayment
);
router.get(
   "/user/orders",
   authService.allowedTo("user"),
   filterOrderForLoggedUser,
   findAllOrders
);
router.get("/orders/:id", findSpecificOrder);

// for admins
router.get("/admin/orders", authService.allowedTo("admin"), findAllOrders);

// for merchant
router.get(
   "/merchant/orders",
   authService.allowedTo("merchant"),
   getMerchantOrders
);

module.exports = router;
