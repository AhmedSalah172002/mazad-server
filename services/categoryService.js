const { Category } = require("../models/categoryModel");
const factory = require("./handlersFactory");

exports.createCategory = factory.createOne(Category, "category");
exports.getAllCategories = factory.getAll(Category, "category");
exports.getOneCategory = factory.getOne(Category, "category");
exports.updateCategory = factory.updateOne(Category, "category");
exports.deleteCategory = factory.deleteOne(Category, "category");
