const slugify = require('slugify');
const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.createProductValidator= [
    check('name')
    .notEmpty()
    .withMessage('المنتج مطلوب')
    .isLength({ min: 3 })
    .withMessage('يجب أن لا يقل عن 3 احرف')
    .isLength({ max: 32 })
    .withMessage('يجب أن لا يزيد عن 32 حرف')
    .custom((val, { req }) => {
        req.body.slug = slugify(val);
        return true;
      }),
      check('description')
      .notEmpty()
      .withMessage('وصف المنتج مطلوب')
      .isLength({ max: 2000 })
      .withMessage('الوصف كبير جدا'),
      check('image')
      .notEmpty()
      .withMessage('الصورة مطلوبة'),
      check('initialPrice')
      .notEmpty()
      .withMessage('السعر المبدئي مطلوب')
    .isNumeric()
    .withMessage('يجب ان تدخل رقما للسعر المبدئي'),
      check('lowestBidValue')
      .notEmpty()
      .withMessage('أقل قيمة للمزايدة مطلوبة')
    .isNumeric()
    .withMessage('يجب ان تدخل رقما '),
    check('biddingStartDate')
    .notEmpty()
    .withMessage('تاريخ البدء مطلوب')
    .custom((val)=>{
      const today = new Date();
      const dateExp=new Date(val)
      if(dateExp <= today){
        throw new Error('يجب أن يكون تاريخ البدء صالح للاستخدام');
      }
      return true;
    }),
    validatorMiddleware,
];

exports.getProductValidator = [
    check('id').isMongoId().withMessage('Invalid ID formate'),
    validatorMiddleware,
  ];
  
  exports.updateProductValidator = [
    check('id').isMongoId().withMessage('Invalid ID formate'),
    body('name')
      .optional()
      .custom((val, { req }) => {
        req.body.slug = slugify(val);
        return true;
      }),
    validatorMiddleware,
  ];
  
  exports.deleteProductValidator = [
    check('id').isMongoId().withMessage('Invalid ID formate'),
    validatorMiddleware,
  ];