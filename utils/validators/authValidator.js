const slugify = require("slugify");
const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const User = require("../../models/userModel");

exports.signupValidator = [
   check("name")
      .notEmpty()
      .withMessage("الاسم مطلوب")
      .isLength({ min: 3 })
      .withMessage("الاسم أقصر من اللازم")
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
               return Promise.reject(new Error("هذا الايميل مستخدم من قبل"));
            }
         })
      ),

   check("password")
      .notEmpty()
      .withMessage("كلمة المرور مطلوبة")
      .isLength({ min: 6 })
      .withMessage("يجب أن تكون كلمة المرور علي الأقل 6 اخرف")
      .custom((password, { req }) => {
         if (password !== req.body.passwordConfirm) {
            throw new Error("كلمة المرور غير متطابقة");
         }
         return true;
      }),
   check("phone")
      .notEmpty()
      .withMessage("رقم الهاتف مطلوب")
      .isMobilePhone(["ar-EG"])
      .withMessage("رقم هاتف غير صالح (يجب ان يكون الرقم مصري)"),
   check("passwordConfirm")
      .notEmpty()
      .withMessage("من فضلك قم بتأكيد كلمة المرور"),
   check("role")
      .notEmpty()
      .withMessage("نوع المستخدم مطلوب")
      .custom((val) => {
         if (val !== "user" && val !== "merchant" && val !== "admin") {
            throw new Error("اختر صلاحية مستخدمة صحيحة");
         }
         return true;
      }),

   validatorMiddleware,
];

exports.loginValidator = [
   check("email")
      .notEmpty()
      .withMessage("الايميل مطلوب")
      .isEmail()
      .withMessage("عنوان بريد غير صالح"),

   check("password")
      .notEmpty()
      .withMessage("كلمة المرور مطلوبة")
      .isLength({ min: 6 })
      .withMessage("يجب أن تكون كلمة المرور علي الأقل 6 اخرف"),

   validatorMiddleware,
];
