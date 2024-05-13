const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const FB = require("fb");
FB.setAccessToken(process.env.FACEBOOK_ACCESS_TOKEN);

exports.getAll = (Model, modelName, special) =>
   asyncHandler(async (req, res, next) => {
      let filter = {};
      if (special === "special") {
         filter = { user: req.user._id };
      } else if (req.filterObj) {
         filter = req.filterObj;
      }
      const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
         .filter()
         .search()
         .limitFields()
         .sort();
      // Execute query
      let { mongooseQuery } = apiFeatures;
      let documents = await mongooseQuery;

      const page = req.query.page * 1 || 1;
      const limit = req.query.limit * 1 || 12;
      const skip = (page - 1) * limit;
      const endIndex = page * limit;

      // Apply pagination to the documents array
      const paginatedDocuments = documents.slice(skip, skip + limit);

      // Pagination result
      const pagination = {};
      pagination.currentPage = page;
      pagination.limit = limit;
      pagination.numberOfPages = Math.ceil(documents.length / limit);

      if (endIndex < documents.length) {
         pagination.next = page + 1;
      }
      if (skip > 0) {
         pagination.prev = page - 1;
      }

      const paginationResult = pagination;

      res.status(200).json({
         results: documents.length,
         paginationResult,
         data: paginatedDocuments,
      });
   });

exports.createOne = (Model, modelName) =>
   asyncHandler(async (req, res, next) => {
      if (modelName === "product") {
         const data = await Model.create(req.body);
         FB.api(
            "me/photos",
            "post",
            {
               url: req.body.image,
               caption: `لقد تم اضافة منتج جديد علي موقعنا واليك التفاصيل : \n\nاسم المنتج : ${req.body.name}.\n\nالوصف : ${req.body.description}.\n\nتاريخ بدء المزايدة : ${req.body.date}.\n\nمن : ${req.body.startTime}.\nالى: ${req.body.endTime}.\n\nالسعر المبدأي للمزاد : ${req.body.initialPrice} جنية.\n\nأقل سعر للمزايدة ${req.body.lowestBidValue} جنية.\n\nاغتنم الفرصة وسارع في التسجيل ليصلك اشعارنا حتي لا تفوتك الفرصة.`,
            },
            function (response) {
               console.log(response);
            }
         );
         res.status(201).json({ data: data });
      } else {
         const data = await Model.create(req.body);
         res.status(201).json({ data: data });
      }
   });

exports.getOne = (Model, modelName) =>
   asyncHandler(async (req, res, next) => {
      const { id } = req.params;
      const data = await Model.findById(id);
      if (!data) {
         return next(new ApiError(`No document for this id ${id}`, 404));
      }
      res.status(200).json({ data: data });
   });

exports.updateOne = (Model, modelName) =>
   asyncHandler(async (req, res, next) => {
      const { id } = req.params;
      const data = await Model.findByIdAndUpdate(req.params.id, req.body, {
         new: true,
      });
      if (!data) {
         return next(new ApiError(`No document for this id ${id}`, 404));
      }

      res.status(200).json({ data: data });
   });

exports.deleteOne = (Model) =>
   asyncHandler(async (req, res, next) => {
      const { id } = req.params;
      const data = await Model.findByIdAndDelete(id);

      if (!data) {
         return next(new ApiError(`No document for this id ${id}`, 404));
      }

      res.status(204).send();
   });
