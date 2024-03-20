const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createCategoryValidator = [
  check("name").notEmpty().withMessage("category name is required"),
  check("image").notEmpty().withMessage("image is required"),
  validatorMiddleware,
];
