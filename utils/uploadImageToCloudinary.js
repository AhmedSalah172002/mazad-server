const path = require("path");
const cloudinary = require("../config/cloudinary");
const util = require("util");
const ApiError = require("./apiError");

const uploadAsync = util.promisify(cloudinary.uploader.upload);


exports.uploadSingleImageToCloudinary = (dirName) => async (req, res, next) => {
  if (req.body.image) {
    try {
      const imagePath = path.join("uploads", dirName, req.body.image);
      const result = await uploadAsync(imagePath, { folder: dirName });
      req.body.image = result.secure_url;
      next();
    } catch (error) {
      console.error(error);
      // Pass the error to the next middleware
      next(error);
    }
  } else {
    next();
  }
};

exports.uploadMultipleImageToCloudinary =
  (dirName) => async (req, res, next) => {
    if (req.files?.length >= 5) {
      return next(new ApiError("max number of images 5"));
    }
    if (req.files && req.files.length > 0) {
      // if upload in images array reset it to have new value
      const existImageInImages = req.files?.some(
        (file) => file.fieldname === "images"
      );
      req.body.images = existImageInImages ? [] : req.product.images;
      try {
        for (const file of req.files) {
          const imagePath = path.join("uploads", dirName, file.originalname);
          const result = await uploadAsync(imagePath, { folder: dirName });
          if (file.fieldname === "image") {
            req.body.image = result.secure_url;
          } else if (file.fieldname === "images") {
            req.body.images.push(result.secure_url);
          }
        }
        next();
      } catch (error) {
        console.error(error);
        next(error);
      }
    } else {
      next();
    }
  };
