const { protect, allowedTo } = require('../services/authService')
const { getProducts, createProduct, getProduct, updateProduct, deleteProduct, uploadImage, resizeImage, specialProducts } = require('../services/productService')
const { createProductValidator, getProductValidator, updateProductValidator, deleteProductValidator } = require('../utils/validators/productValidator')

const express=require('express')

const router=express.Router()



router.route('/')
.get(getProducts)
.post(protect,allowedTo("Merchant"),uploadImage,resizeImage,createProductValidator,createProduct)
router.route('/special').get(protect,allowedTo("Merchant"),specialProducts)

router.route('/:id')
.get(getProductValidator,getProduct)
.put(protect,allowedTo("Merchant"),uploadImage,resizeImage,updateProductValidator,updateProduct)
.delete(protect,allowedTo("Merchant"),deleteProductValidator,deleteProduct)

module.exports = router;
