const { default: mongoose } = require("mongoose");
const { setImageURL } = require("./productModel");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    unique: [true, "category must be unique"],
    minlength: [2, "too short category name"],
  },
  image: {
    type: String,
  },
});

// findOne, findAll and update
categorySchema.post("init", (doc) => {
  setImageURL(doc, 'categories');
});


const Category = mongoose.model("Category", categorySchema);

module.exports = {
  Category,
};
