const express = require("express");
const router = express.Router({ mergeParams: true });

const Review = require("../models/reviews.js");
const Listing = require("../models/listing");

const wrapasync = require("../utils/wrapasync");
const expressError = require("../utils/expresserror");

const { reviewSchema } = require("../schema.js");

const validatereview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);

  if (error && error.details) {
    const errormsg = error.details.map((el) => el.message).join(", ");
    throw new expressError(400, errormsg);
  } else {
    next();
  }
};

//Reviews Post route
router.post(
  "/",
  validatereview,
  wrapasync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.review.push(newReview);
    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
  })
);

//review delete route
router.delete(
  "/:reviewId",
  wrapasync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { review: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
