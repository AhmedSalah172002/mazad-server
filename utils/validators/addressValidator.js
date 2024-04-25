const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const ApiError = require("../apiError");

exports.createAddressValidator = [
   check("alias").notEmpty().withMessage("العنوان الرئيسي مطلوب"),
   check("details").notEmpty().withMessage("تفاصيل العنوان مطلوبة"),
   check("city")
      .notEmpty()
      .withMessage("المدينة مطلوبة")
      .custom((value, { req }) => {
         if (!req.user.phone){
            throw ApiError("Phone is required", 400)
         }
         req.body.phone = req.user.phone;
         return true
      }),
   validatorMiddleware,
];

exports.getAddressValidator = [
   check("addressId").isMongoId().withMessage("Invalid Address id format"),
   validatorMiddleware,
];

exports.updateAddressValidator = [
   check("addressId").isMongoId().withMessage("Invalid Address id format"),
   check("alias").optional(),
   check("details").optional(),
   check("phone").optional(),
   check("city").optional(),
   validatorMiddleware,
];

exports.deleteAddressValidator = [
   check("addressId").isMongoId().withMessage("Invalid Address id format"),
   validatorMiddleware,
];
