const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.createAddressValidator = [
  check('alias').notEmpty()
  .withMessage('العنوان الرئيسي مطلوب'),
  check('details')
    .notEmpty()
    .withMessage('تفاصيل العنوان مطلوبة'),
    check('phone')
    .isMobilePhone(['ar-EG'])
    .withMessage('رقم هاتف غير صالح (يجب ان يكون الرقم مصري)'),
    check('city').notEmpty()
    .withMessage('المدينة مطلوبة'),
  validatorMiddleware,
];

exports.getAddressValidator = [
  check('addressId').isMongoId().withMessage('Invalid Address id format'),
  validatorMiddleware,
];

exports.updateAddressValidator = [
  check('addressId')
    .isMongoId()
    .withMessage('Invalid Address id format'),
    check('alias').optional(),
    check('details').optional(),
    check('phone').optional(),
    check('city').optional(),
  validatorMiddleware,
];

exports.deleteAddressValidator = [
  check('addressId')
    .isMongoId()
    .withMessage('Invalid Address id format'),
  validatorMiddleware,
];
