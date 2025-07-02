const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const review = require("./reviews");

const listingSchema = Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    type: String,
    default:
      "https://imgs.search.brave.com/YxU5__ZmYIWW9ftE4peSNm3CsMhQsUx2-MNJUBtcCMU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJzLmNvbS9p/bWFnZXMvaGQvd2lu/ZG93cy1kZWZhdWx0/LWJhY2tncm91bmQt/aWh1ZWNqazJtaGFs/dzNucS5qcGc",
    set: (v) =>
      v === " "
        ? "https://imgs.search.brave.com/YxU5__ZmYIWW9ftE4peSNm3CsMhQsUx2-MNJUBtcCMU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJzLmNvbS9p/bWFnZXMvaGQvd2lu/ZG93cy1kZWZhdWx0/LWJhY2tncm91bmQt/aWh1ZWNqazJtaGFs/dzNucS5qcGc"
        : v,
  },
  price: Number,
  review: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if(listing){
    await review.deleteMany({ _id: { $in: listing.review } });
  }
});

const listing = mongoose.model("Listing", listingSchema);
module.exports = listing;
