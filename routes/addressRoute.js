const express = require('express');

const authService = require('../services/authService');

const {
  addAddress,
  removeAddress,
  getLoggedUserAddresses,
  updateAddress,
  getSpecificAddress,
} = require('../services/addressService');
const { createAddressValidator, getAddressValidator, updateAddressValidator, deleteAddressValidator } = require('../utils/validators/addressValidator');

const router = express.Router();

router.use(authService.protect, authService.allowedTo('user'));

router.route('/').post(createAddressValidator,addAddress).get(getLoggedUserAddresses);

router.route('/:addressId').delete(deleteAddressValidator,removeAddress).put(updateAddressValidator,updateAddress).get(getAddressValidator,getSpecificAddress)

module.exports = router;
