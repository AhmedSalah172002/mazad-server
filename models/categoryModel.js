const { default: mongoose } = require("mongoose");

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


const Category = mongoose.model("Category", categorySchema);

module.exports = {
  Category,
};
