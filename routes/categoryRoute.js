const express = require("express");
const {
  createCategory,
  getAllCategories,
  getOneCategory,
  updateCategory,
  deleteCategory,
} = require("../services/categoryService");
const {
  createCategoryValidator,
} = require("../utils/validators/categoryValidator");
const { uploadImage, resizeImage } = require("../services/productService");
const { allowedTo, protect } = require("../services/authService");

const router = express.Router();

router
  .route("/category")
  .post(
    protect,
    allowedTo("admin"),
    uploadImage,
    resizeImage("categories"),
    createCategoryValidator,
    createCategory
  )
  .get(getAllCategories);

router
  .route("/category/:id")
  .get(getOneCategory)
  .put(
    protect,
    allowedTo("admin"),
    uploadImage,
    resizeImage("categories"),
    updateCategory
  )
  .delete(protect, allowedTo("admin"), deleteCategory);

module.exports = router;
