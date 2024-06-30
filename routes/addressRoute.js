const express = require("express");

const authService = require("../services/authService");

const {
   addAddress,
   removeAddress,
   getLoggedUserAddresses,
   updateAddress,
   getSpecificAddress,
} = require("../services/addressService");
const {
   createAddressValidator,
   getAddressValidator,
   updateAddressValidator,
   deleteAddressValidator,
} = require("../utils/validators/addressValidator");

const router = express.Router();

router
   .route("/")
   .post(
      authService.protect,
      authService.allowedTo("user", "merchant"),
      createAddressValidator,
      addAddress
   )
   .get(
      authService.protect,
      authService.allowedTo("user", "merchant"),
      getLoggedUserAddresses
   );

router
   .route("/:addressId")
   .delete(
      authService.protect,
      authService.allowedTo("user", "merchant"),
      deleteAddressValidator,
      removeAddress
   )
   .put(
      authService.protect,
      authService.allowedTo("user", "merchant"),
      updateAddressValidator,
      updateAddress
   )
   .get(
      authService.protect,
      authService.allowedTo("user", "merchant"),
      getAddressValidator,
      getSpecificAddress
   );

module.exports = router;
