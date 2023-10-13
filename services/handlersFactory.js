const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeatures');



const StatusMode= async(Model)=>{
  const currentUTC = new Date();
  // Add 3 hours to the current UTC time
  const utcPlus3Hours = new Date(currentUTC.getTime() + 1 * 60 * 60 * 1000)



  const result = await Model.updateMany(
    {
      $and: [
        { BiddingEndTime: { $gte: utcPlus3Hours } },
        { BiddingStartTime: { $lte: utcPlus3Hours } }
      ]
    },
    { $set: { status: 'start-now' } }
  );

  const res = await Model.updateMany(
    {
      $and: [
        { BiddingEndTime: { $lte: utcPlus3Hours } },
        { BiddingStartTime: { $lte: utcPlus3Hours } }
      ]
    },
    { $set: { status: 'finished' } }
  );

  const Res = await Model.updateMany(
    {
      $and: [
        { BiddingEndTime: { $gte: utcPlus3Hours } },
        { BiddingStartTime: { $gte: utcPlus3Hours } }
      ]
    },
    { $set: { status: 'not-started' } }
  );
}

exports.getAll = (Model,modelName,special) =>
  asyncHandler(async (req, res, next) => {
    let filter = {};
    if (special === "special") {   
      filter = {Merchant:req.user._id}
    }else if (req.filterObj) {
      filter = req.filterObj;
    }
  

    if(modelName==="product"){
      StatusMode(Model)
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
      results: paginatedDocuments.length,
      paginationResult,
      data: paginatedDocuments,
    });
  });


exports.createOne=(Model,modelName) =>
asyncHandler(async(req,res,next)=>{
  if(modelName==="product"){

    const BiddingEndTime=
     new Date(new Date(req.body.BiddingStartTime).setDate(new Date(req.body.BiddingStartTime).getDate()+1)).toLocaleDateString();
    
    const data = await Model.create({
      name:req.body.name,
      slug:req.body.slug,
      image:req.body.image,
      description:req.body.description,
      InitialPrice:req.body.InitialPrice,
      LowestBidValue:req.body.LowestBidValue,
      BiddingStartTime:req.body.BiddingStartTime,
      Merchant:req.body.Merchant,
      BiddingEndTime,
    });
    res.status(201).json({ data: data });
  }else{
    const data = await Model.create(req.body);
    res.status(201).json({ data: data });
  }
    
})

exports.getOne=(Model,modelName) =>
asyncHandler(async(req,res,next)=>{
  if(modelName==="product"){
    StatusMode(Model)
  }
    const { id } = req.params;
    const data = await Model.findById(id);
    if(!data){
      return next(new  ApiError(`No document for this id ${id}`,404))
    }
    res.status(200).json({ data: data });
})

exports.updateOne=(Model,modelName) =>
asyncHandler(async(req,res,next)=>{
    const { id } = req.params;
    if (req.body.BiddingStartTime){
      const BiddingEndTime=
      new Date(new Date(req.body.BiddingStartTime).setDate(new Date(req.body.BiddingStartTime).getDate()+1)).toLocaleDateString();
      const expired = await Model.findByIdAndUpdate(req.params.id, {BiddingEndTime:BiddingEndTime}, {
        new: true,
      });
    }
    const data = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
    if(!data){
      return next(new  ApiError(`No document for this id ${id}`,404))
    }

    res.status(200).json({ data: data });
})

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const data = await Model.findByIdAndDelete(id);

    if (!data) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }


    res.status(204).send();
  });