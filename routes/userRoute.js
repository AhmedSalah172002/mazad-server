const express = require("express");
const {
   getUserValidator,
   createUserValidator,
   updateUserValidator,
   deleteUserValidator,
   changeUserPasswordValidator,
   updateLoggedUserValidator,
   changeMyPasswordValidator,
} = require("../utils/validators/userValidator");

const {
   getUsers,
   getUser,
   createUser,
   updateUser,
   deleteUser,
   changeUserPassword,
   getLoggedUserData,
   updateLoggedUserPassword,
   updateLoggedUserData,
   deleteLoggedUserData,
   getAllMerchants,
} = require("../services/userService");
const { protect, allowedTo } = require("../services/authService");
const {
   uploadSingleImageToCloudinary,
} = require("../utils/uploadImageToCloudinary");
const { resizeImage, uploadImage } = require("../services/productService");

const router = express.Router();


router.get("/getMe", protect, getLoggedUserData, getUser);
router.put(
   "/changeMyPassword",
   protect,
   changeMyPasswordValidator,
   updateLoggedUserPassword
);
router.put(
   "/updateMe",
   protect,
   uploadImage("image"),
   resizeImage("users"),
   uploadSingleImageToCloudinary("users"),
   updateLoggedUserValidator,
   updateLoggedUserData
);
router.delete("/deleteMe", protect, deleteLoggedUserData);

// Admin
router.put(
   "/changePassword/:id",
   protect,
   allowedTo("admin"),
   changeUserPasswordValidator,
   changeUserPassword
);
router
   .route("/")
   .get(protect, allowedTo("admin"), getUsers)
   .post(protect, allowedTo("admin"), createUserValidator, createUser);
router
   .route("/:id")
   .get(protect, allowedTo("admin"), getUserValidator, getUser)
   .put(protect, allowedTo("admin"), updateUserValidator, updateUser)
   .delete(protect, allowedTo("admin"), deleteUserValidator, deleteUser);

router.get("/admin/merchants", protect, allowedTo("admin"), getAllMerchants);

module.exports = router;
