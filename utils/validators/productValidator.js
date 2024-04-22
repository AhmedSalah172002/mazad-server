const slugify = require("slugify");
const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createProductValidator = [
   check("name")
      .notEmpty()
      .withMessage("اسم المنتج مطلوب")
      .isLength({ min: 3 })
      .withMessage("يجب أن لا يقل عن 3 احرف")
      .isLength({ max: 32 })
      .withMessage("يجب أن لا يزيد عن 32 حرف")
      .custom((val, { req }) => {
         req.body.slug = slugify(val);
         return true;
      }),
   check("description")
      .notEmpty()
      .withMessage("وصف المنتج مطلوب")
      .isLength({ max: 2000 })
      .withMessage("الوصف كبير جدا"),
   check("image").notEmpty().withMessage("الصورة مطلوبة"),
   check("initialPrice")
      .notEmpty()
      .withMessage("السعر المبدئي مطلوب")
      .isNumeric()
      .withMessage("يجب ان تدخل رقما للسعر المبدئي"),
   check("lowestBidValue")
      .notEmpty()
      .withMessage("أقل قيمة للمزايدة مطلوبة")
      .isNumeric()
      .withMessage("يجب ان تدخل رقما "),
   check("date")
      .notEmpty()
      .withMessage("التاريخ مطلوب")
      .isISO8601()
      .withMessage("تاريخ غير صالح")
      .custom((value, { req }) => {
         const currentDate = new Date().toISOString().slice(0, 10);
         if (value <= currentDate) {
            throw new Error("تاريخ المنتج يجب أن يكون أكبر من تاريخ اليوم");
         }
         return true;
      }),
   check("startTime")
      .notEmpty()
      .withMessage("وقت البدء مطلوب")
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage(
         "وقت البدء غير صالح! يجب أن يكون في الصيغة HH:MM (مثال: 17:00)"
      ),
   check("endTime")
      .notEmpty()
      .withMessage("وقت الانتهاء مطلوب")
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage(
         "وقت الانتهاء غير صالح! يجب أن يكون في الصيغة HH:MM (مثال: 17:00)"
      ),

   check(["startTime", "endTime"]).custom((value, { req }) => {
      const startTime = new Date(`${req.body.date}T${req.body.startTime}`);
      const endTime = new Date(`${req.body.date}T${req.body.endTime}`);
      if (startTime >= endTime) {
         throw new Error("وقت البدء يجب أن يكون قبل وقت الانتهاء");
      }
      return true;
   }),

   validatorMiddleware,
];

exports.getProductValidator = [
   check("id").isMongoId().withMessage("Invalid ID formate"),
   validatorMiddleware,
];

exports.updateProductValidator = [
   check("id").isMongoId().withMessage("Invalid ID formate"),
   body("name")
      .optional()
      .custom((val, { req }) => {
         req.body.slug = slugify(val);
         return true;
      }),
   check("date")
      .optional()
      .isISO8601()
      .withMessage("تاريخ غير صالح")
      .custom((value, { req }) => {
         const currentDate = new Date().toISOString().slice(0, 10);
         if (value <= currentDate) {
            throw new Error("تاريخ المنتج يجب أن يكون أكبر من تاريخ اليوم");
         }
         return true;
      }),
   check("startTime")
      .optional()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage(
         "وقت البدء غير صالح! يجب أن يكون في الصيغة HH:MM (مثال: 17:00)"
      ),
   check("endTime")
      .optional()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage(
         "وقت الانتهاء غير صالح! يجب أن يكون في الصيغة HH:MM (مثال: 17:00)"
      ), 
   validatorMiddleware,
];

exports.deleteProductValidator = [
   check("id").isMongoId().withMessage("Invalid ID formate"),
   validatorMiddleware,
];
