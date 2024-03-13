const slugify = require("slugify");
const bcrypt = require("bcryptjs");
const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const User = require("../../models/userModel");

exports.createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("الاسم مطلوب")
    .isLength({ min: 3 })
    .withMessage("الاسم صغير جدا")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("email")
    .notEmpty()
    .withMessage("الايميل مطلوب")
    .isEmail()
    .withMessage("عنوان بريد غير صالح")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("هذا الايميل موجود بالفعل"));
        }
      })
    ),

  check("password")
    .notEmpty()
    .withMessage("الباسورد مطلوب")
    .isLength({ min: 6 })
    .withMessage(" يجب أن لا يقل الباسورد عن 6 أحرف")
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error("الباسورد غير متطابق");
      }
      return true;
    }),

  check("passwordConfirm").notEmpty().withMessage("يجب مطابقة الباسورد"),

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG"])
    .withMessage("رقم هاتف غير صالح (يجب ان يكون الرقم مصري)"),
  check("role").optional(),

  validatorMiddleware,
];

exports.getUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  validatorMiddleware,
];

exports.updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  body("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .optional()
    .notEmpty()
    .withMessage("الايميل مطلوب")
    .isEmail()
    .withMessage("عنوان بريد غير صالح")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user && user.email !== val) {
          return Promise.reject(new Error("هذا الايميل موجود بالفعل"));
        }
      })
    ),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG"])
    .withMessage("رقم هاتف غير صالح (يجب ان يكون الرقم مصري)"),
  check("role").optional(),
  validatorMiddleware,
];

exports.changeUserPasswordValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  body("currentPassword")
    .notEmpty()
    .withMessage("يجب عليك ان تدخل الباسورد الحالي"),
  body("passwordConfirm").notEmpty().withMessage("يجب مطابقة الباسورد"),
  body("password")
    .notEmpty()
    .withMessage("الباسورد مطلوب")
    .custom(async (val, { req }) => {
      // 1) Verify current password
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new Error("There is no user for this id");
      }
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPassword) {
        throw new Error("الباسورد غير صحيح");
      }

      // 2) Verify password confirm
      if (val !== req.body.passwordConfirm) {
        throw new Error("الباسورد غير متطابق");
      }
      return true;
    }),
  validatorMiddleware,
];

exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  validatorMiddleware,
];

exports.updateLoggedUserValidator = [
  body("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .optional()
    .notEmpty()
    .withMessage("الايميل مطلوب")
    .isEmail()
    .withMessage("عنوان بريد غير صالح")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("هذا الايميل موجود بالفعل"));
        }
      })
    ),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG"])
    .withMessage("رقم هاتف غير صالح (يجب ان يكون الرقم مصري)"),

  validatorMiddleware,
];

exports.changeMyPasswordValidator = [
  body("currentPassword")
    .notEmpty()
    .withMessage("يجب عليك ان تدخل الباسورد الحالي"),
  body("passwordConfirm").notEmpty().withMessage("يجب مطابقة الباسورد"),
  body("password")
    .notEmpty()
    .withMessage("الباسورد مطلوب")
    .custom(async (val, { req }) => {
      // 1) Verify current password
      const user = await User.findById(req.user._id);
      if (!user) {
        throw new Error("There is no user for this id");
      }
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPassword) {
        throw new Error("الباسورد غير صحيح");
      }

      // 2) Verify password confirm
      if (val !== req.body.passwordConfirm) {
        throw new Error("الباسورد غير متطابق");
      }
      return true;
    }),
  validatorMiddleware,
];
