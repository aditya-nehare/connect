const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    type: String,
    default: "default image",
    set: (v) => (v === " " ? "default image" : v),
  },
  price: Number,
  location: String,
});

const listing = mongoose.model("Listing", listingSchema);
module.exports = listing;
