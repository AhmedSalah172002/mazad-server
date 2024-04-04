const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");

const { Product } = require("../models/productModel");
const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

// Upload single image
exports.uploadImage = uploadSingleImage("image");

// Image processing
exports.resizeImage = (dirName) =>
  asyncHandler(async (req, res, next) => {
    const filename = `${dirName}-${uuidv4()}-${Date.now()}.jpeg`;

    if (req.file) {
      await sharp(req.file.buffer)
        .toFormat("jpeg")
        .jpeg({ quality: 95 })
        .toFile(`uploads/${dirName}/${filename}`);

      req.body.image = filename;
    }
    next();
  });

// @desc    Get list of products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = factory.getAll(Product, "product");

// @desc    Get specific product by id
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = factory.getOne(Product, "product");

// @desc    Create product
// @route   POST  /api/v1/products
// @access  Private
exports.createProduct = factory.createOne(Product, "product");
// @desc    Update specific product
// @route   PUT /api/v1/products/:id
// @access  Private
exports.updateProduct = factory.updateOne(Product, "product");

// @desc    Delete specific product
// @route   DELETE /api/v1/products/:id
// @access  Private
exports.deleteProduct = factory.deleteOne(Product);

// @desc    Delete specific product
// @route   DELETE /api/v1/products/:id
// @access  Private
exports.specialProducts = factory.getAll(Product, "product", "special");

exports.getSpecificProductMeddleWare = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  req.product = product;
  next();
});
