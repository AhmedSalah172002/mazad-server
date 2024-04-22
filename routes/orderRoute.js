const express = require("express");
const {
   findAllOrders,
   findSpecificOrder,
   filterOrderForLoggedUser,
   checkoutSession,
} = require("../services/orderService");

const authService = require("../services/authService");

const router = express.Router();

router.use(authService.protect);

router.get(
   "/checkout-session/:cartId",
   authService.allowedTo("user"),
   checkoutSession
);

router.get(
   "/",
   authService.allowedTo("user"),
   filterOrderForLoggedUser,
   findAllOrders
);
router.get("/:id", findSpecificOrder);

module.exports = router;
