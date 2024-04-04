const path = require("path");
const cloudinary = require("../config/cloudinary");

exports.uploadSingleImageToCloudinary = (dirName) => async (req, res, next) => {
  const imagePath = path.join("uploads", dirName, req.body.image);
  cloudinary.uploader.upload(
    imagePath,
    { folder: dirName },
    function (error, result) {
      if (error) {
        console.log(error);
      } else {
        req.body.image = result.secure_url
        next();
      }
    }
  );
};