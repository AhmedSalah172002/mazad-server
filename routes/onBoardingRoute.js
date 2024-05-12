const express = require("express");
const authService = require("../services/authService");
const { OnboardingAccount } = require("../services/onBoardingService");
const router = express.Router();

router
   .route('/onboarding/account')
   .get(authService.protect, authService.allowedTo("merchant"), OnboardingAccount);

module.exports = router;

