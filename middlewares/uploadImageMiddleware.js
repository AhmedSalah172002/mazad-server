const multer = require("multer");
const ApiError = require("../utils/apiError");
const path = require('path')

const multerOptions = () => {
  const multerStorage = multer.memoryStorage();

  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("Only Images allowed", 400), false);
    }
  };

  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

  return upload;
};

exports.uploadSingleImage = (fieldName) => multerOptions().single(fieldName);

exports.uploadMultipleImageMulter = (dirName) => {
  const upload = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, path.join('uploads', dirName));
      },
      filename: function (req, file, cb) {
        cb(null, file.originalname);
      },
    }),
    fileFilter: function (req, file, cb) {
      // Define file filter for allowed file types, if needed
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.mimetype)) {
        cb(
          new Error("Invalid file type. Only JPEG and PNG files are allowed.")
        );
      } else {
        cb(null, true);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  }).any();

  return (req, res, next) => {
    upload(req, res, function (err) {
      if (err) {
        return res.status(400).send({ message: err.message });
      }
      next(); 
    });
  };
};
