const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = Schema({
  comment: String,
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  created:{
    type: Date,
    default: Date.now(),
  }
});

const review = mongoose.model("Review", reviewSchema);
module.exports = review;
