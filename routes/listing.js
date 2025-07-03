const express = require("express");
const mongoose = require("mongoose");
const router = express.Router({ mergeParams: true });

const wrapasync = require("../utils/wrapasync");
const expressError = require("../utils/expresserror");

const Listing = require("../models/listing");
const { listingSchema } = require("../schema.js");

const validatelisting = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);

  if (error && error.details) {
    const errormsg = error.details.map((el) => el.message).join(", ");
    throw new expressError(400, errormsg);
  } else {
    next();
  }
};

// Index Route
router.get(
  "/",
  wrapasync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

// Add-New Listing Form Route
router.get("/addNew", (req, res) => {
  res.render("listings/addNew.ejs");
});

// Show Route
router.get(
  "/:id",
  wrapasync(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash("failure", "Invalid listing ID");
      return res.redirect("/listings");
    }

    const listing = await Listing.findById(id).populate("review");
    if (!listing) {
      req.flash("failure", "Listing not found");
      return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
  })
);

// Create Route
router.post(
  "/",
  validatelisting,
  wrapasync(async (req, res, next) => {
    try {
      const newListing = new Listing(req.body.listing);
      await newListing.save();
      req.flash("success", "Listing created");
      res.redirect("/listings");
    } catch (e) {
      req.flash("failure", "Failed to create listing");
      res.redirect("/listings/addNew");
    }
  })
);

// Edit Form Route
router.get(
  "/:id/edit",
  wrapasync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);

// Update Route
router.put(
  "/:id",
  validatelisting,
  wrapasync(async (req, res) => {
    const { id } = req.params;
    try {
      await Listing.findByIdAndUpdate(id, { ...req.body.listing });
      req.flash("success", "Listing updated");
      res.redirect(`/listings/${id}`);
    } catch (e) {
      req.flash("failure", "Failed to update listing");
      res.redirect(`/listings/${id}/edit`);
    }
  })
);

// Delete Route
router.delete(
  "/:id",
  wrapasync(async (req, res) => {
    const { id } = req.params;
    try {
      await Listing.findByIdAndDelete(id);
      req.flash("success", "Listing deleted");
    } catch (e) {
      req.flash("failure", "Failed to delete listing");
    }
    res.redirect("/listings");
  })
);

module.exports = router;
