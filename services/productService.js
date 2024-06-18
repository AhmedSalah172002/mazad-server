const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const { Product } = require("../models/productModel");
const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const moment = require("moment");

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

exports.updateProductsStatus = async (req, res, next) => {
   try {
      const today = new Date().toISOString().split("T")[0];

      // Find products that need status update based on criteria
      const productsToUpdate = await Product.find({
         $or: [
            { date: { $lt: today }, status: { $ne: "finished" } }, // Get old products not marked as finished
            {
               date: today,
            },
         ],
      });

      // Update the status of each product based on its criteria
      productsToUpdate.forEach(async (product) => {
         const productDateString = new Date(product.date)
            .toISOString()
            .split("T")[0];
         const startTime = new Date(
            `${productDateString}T${product.startTime}:00`
         )
            .toISOString()
            .split("T")[1]
            .substring(0, 5);
         const endTime = new Date(`${productDateString}T${product.endTime}:00`)
            .toISOString()
            .split("T")[1]
            .substring(0, 5);
         const currentTime = new Date()
            .toISOString()
            .split("T")[1]
            .substring(0, 5); // Get only HH:mm from ISO string

         if (
            productDateString < today || // For old products
            (productDateString === today && // For products with date equal to today
               endTime < currentTime)
         ) {
            product.status = "finished";
         }
         if (
            productDateString === today &&
            startTime < currentTime &&
            endTime > currentTime
         ) {
            product.status = "start-now";
         }
         if (
            productDateString > today ||
            (productDateString === today && // For products with date equal to today
               startTime > currentTime)
         ) {
            product.status = "not-started";
         }

         await product.save();
      });

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

      const currentDate = new Date().toISOString().split("T")[0];
      const productDateString = new Date(product.date)
         .toISOString()
         .split("T")[0];
      const startTime = new Date(`${productDateString}T${product.startTime}:00`)
         .toISOString()
         .split("T")[1]
         .substring(0, 5);
      const endTime = new Date(`${productDateString}T${product.endTime}:00`)
         .toISOString()
         .split("T")[1]
         .substring(0, 5);
      const currentTime = new Date()
         .toISOString()
         .split("T")[1]
         .substring(0, 5); // Get only HH:mm from ISO string

      if (
         productDateString > currentDate ||
         (productDateString == currentDate && startTime > currentTime)
      ) {
         product.status = "not-started";
      }
      if (
         productDateString == currentDate &&
         startTime < currentTime &&
         endTime > currentTime
      ) {
         product.status = "start-now";
      }
      if (
         productDateString < currentDate ||
         (productDateString == currentDate && endTime < currentTime)
      ) {
         product.status = "finished";
      }

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
         const currentTime = new Date();
         // Add 1 minute to the current time
         currentTime.setMinutes(currentTime.getMinutes() + 1);
         // Format as ISO string and extract time part (HH:mm:ss)
         const isoTimeString = currentTime
            .toISOString()
            .split("T")[1]
            .substring(0, 8);
         // Use moment.js to parse and format the time
         const formattedTime = moment
            .utc(isoTimeString, "HH:mm:ss")
            .local()
            .format("HH:mm");
         product.endTime = formattedTime
      }

      await product.save();
      next();
      res.status(200).json({ status: "success" });
   } catch (error) {
      // Handle any errors
      return res.status(500).json({ error: "Internal server error" });
   }
};
