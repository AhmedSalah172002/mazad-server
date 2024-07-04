const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const { Product } = require("../models/productModel");
const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const moment = require("moment");
const { Review } = require("../models/reviewModel");
const { getMerchantAverageReviews } = require("./reviewService");
const ApiError = require("../utils/apiError");
const { log } = require("console");

// Upload single image
exports.uploadImage = (imageField) => uploadSingleImage(imageField);

// Image processing
exports.resizeImage = (dirName) =>
   asyncHandler(async (req, res, next) => {
      const dirPath = path.join(__dirname, `../uploads/${dirName}`);

      if (!fs.existsSync(dirPath)) {
         fs.mkdirSync(dirPath, { recursive: true });
      }

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
exports.getProduct = asyncHandler(async (req, res, next) => {
   const { id } = req.params;
   let data = await Product.findById(id);
   if (!data) {
      return next(new ApiError(`No document for this id ${id}`, 404));
   }
   data = data.toObject();

   const reviews = await Review.find({ merchant: data.user._id });
   const merchantReview = getMerchantAverageReviews(reviews);
   data.user.reviews = merchantReview;

   res.status(200).json({ data: data });
});

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

const TimeNow = require("moment-timezone");

const timezone = "Africa/Cairo";

const getCurrentDate = () => TimeNow().tz(timezone).format("YYYY-MM-DD");
const getCurrentTime = () => TimeNow().tz(timezone).format("HH:mm");
const getProductDateString = (date) => TimeNow(date).tz(timezone).format("YYYY-MM-DD");

const updateProductStatusBasedOnTime = (product, today, currentTime) => {
   const productDateString = getProductDateString(product.date);
   const { startTime, endTime } = product;

   if (
      productDateString < today || // For old products
      (productDateString === today && endTime < currentTime) // For products with date equal to today
   ) {
      product.status = "finished";
   } else if (
      productDateString === today &&
      startTime < currentTime &&
      endTime > currentTime
   ) {
      product.status = "start-now";
   } else if (
      productDateString > today ||
      (productDateString === today && startTime > currentTime)
   ) {
      product.status = "not-started";
   }

   return product;
};

exports.updateProductsStatus = async (req, res, next) => {
   try {
      const today = getCurrentDate();
      const currentTime = getCurrentTime();

      // Find products that need status update based on criteria
      const productsToUpdate = await Product.find({
         $or: [
            { date: { $lt: today }, status: { $ne: "finished" } }, // Get old products not marked as finished
            { date: today }
         ],
      });

      // Update the status of each product based on its criteria
      await Promise.all(productsToUpdate.map(async (product) => {
         product = updateProductStatusBasedOnTime(product, today, currentTime);
         await product.save();
      }));

      // Continue to the next middleware or route handler
      next();
   } catch (error) {
      // Handle any errors
      return res.status(500).json({ error: "Internal server error" });
   }
};

exports.updateProductStatus = async (req, res, next) => {
   try {
      // Update product status based on criteria
      const product = await Product.findById(req.params.id);
      if (!product) {
         return res.status(404).json({ error: "Product not found" });
      }

      const today = getCurrentDate();
      const currentTime = getCurrentTime();

      product = updateProductStatusBasedOnTime(product, today, currentTime);
      await product.save();
      next();
   } catch (error) {
      // Handle any errors
      return res.status(500).json({ error: "Internal server error" });
   }
};

exports.terminateProductStatus = async (req, res, next) => {
   try {
      // Update product status based on criteria
      const product = await Product.findById(req.params.id);
      if (!product) {
         return res.status(404).json({ error: "Product not found" });
      }

      if (product.status === "start-now") {
         const currentTime = TimeNow().tz(timezone).add(1, 'minute'); // Add 1 minute to the current time
         const formattedTime = currentTime.format("HH:mm");
         product.endTime = formattedTime;
      }

      await product.save();
      next();
      res.status(200).json({ status: "success" });
   } catch (error) {
      // Handle any errors
      return res.status(500).json({ error: "Internal server error" });
   }
};
