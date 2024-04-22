const express = require("express");

const authService = require("../services/authService");

const { addMazad } = require("../services/mazadService");

const router = express.Router();

router
   .route("/:id")
   .post(authService.protect, authService.allowedTo("user"), addMazad);

module.exports = router;
