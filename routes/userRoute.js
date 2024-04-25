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
} = require("../services/userService");
const { protect, allowedTo } = require("../services/authService");
const {
   uploadSingleImageToCloudinary,
} = require("../utils/uploadImageToCloudinary");
const { resizeImage, uploadImage } = require("../services/productService");

const router = express.Router();

router.use(protect);

router.get("/getMe", getLoggedUserData, getUser);
router.put(
   "/changeMyPassword",
   changeMyPasswordValidator,
   updateLoggedUserPassword
);
router.put(
   "/updateMe",
   uploadImage('image'),
   resizeImage("users"),
   uploadSingleImageToCloudinary("users"),
   updateLoggedUserValidator,
   updateLoggedUserData
);
router.delete("/deleteMe", deleteLoggedUserData);

// Admin
router.use(allowedTo("admin"));
router.put(
   "/changePassword/:id",
   changeUserPasswordValidator,
   changeUserPassword
);
router.route("/").get(getUsers).post(createUserValidator, createUser);
router
   .route("/:id")
   .get(getUserValidator, getUser)
   .put(updateUserValidator, updateUser)
   .delete(deleteUserValidator, deleteUser);

module.exports = router;
