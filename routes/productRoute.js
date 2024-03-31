const { protect, allowedTo } = require("../services/authService");
const {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  resizeImage,
  specialProducts,
} = require("../services/productService");
const {
  createProductValidator,
  getProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../utils/validators/productValidator");

const express = require("express");

const router = express.Router();

const setUserInBody = (req, res, next) => {
  req.body.user = req.user._id.toString();
  next();
};

router
  .route("/")
  .get(getProducts)
  .post(
    protect,
    allowedTo("merchant"),
    uploadImage,
    resizeImage("products"),
    setUserInBody,
    createProductValidator,
    createProduct
  );
router.route("/special").get(protect, allowedTo("merchant"), specialProducts);

router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(
    protect,
    allowedTo("merchant"),
    uploadImage,
    resizeImage("products"),
    setUserInBody,
    updateProductValidator,
    updateProduct
  )
  .delete(
    protect,
    allowedTo("merchant"),
    setUserInBody,
    deleteProductValidator,
    deleteProduct
  );

module.exports = {
  router,
  setUserInBody,
};
