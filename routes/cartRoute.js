const express = require("express");

const {
   addProductToCart,
   getLoggedUserCart,
} = require("../services/cartService");
const authService = require("../services/authService");

const router = express.Router();

router
   .route("/")
   .post(authService.protect, authService.allowedTo("user"), addProductToCart)
   .get(authService.protect, authService.allowedTo("user"), getLoggedUserCart);

module.exports = router;
