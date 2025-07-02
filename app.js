const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const Listing = require("./models/listing");
const wrapasync = require("./utils/wrapasync");
const expressError = require("./utils/expresserror");
const Review = require("./models/reviews.js");

const { listingSchema } = require("./schema.js");
const { reviewSchema } = require("./schema.js");
const review = require("./models/reviews.js");
const listing = require("./models/listing");

require("dotenv").config();

const app = express();
const port = 8080;
const MONGO_URL = process.env.MONGO_URI;

// Connect to MongoDB
main()
  .then(() => console.log("Successfully connected to the database."))
  .catch((err) => console.error("Database connection failed:", err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

// Set up EJS and views
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public"))); // For static files

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the root API.");
});

const validatelisting = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);

  if (error && error.details) {
    const errormsg = error.details.map((el) => el.message).join(", ");
    throw new expressError(400, errormsg);
  } else {
    next();
  }
};

const validatereview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);

  if (error && error.details) {
    const errormsg = error.details.map((el) => el.message).join(", ");
    throw new expressError(400, errormsg);
  } else {
    next();
  }
};

// Index Route
app.get(
  "/listings",
  wrapasync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

// Add-New Listing Form Route
app.get("/listings/addNew", (req, res) => {
  res.render("listings/addNew.ejs");
});

// Show Route
app.get(
  "/listings/:id",
  wrapasync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("review");
    res.render("listings/show.ejs", { listing });
  })
);

// Create Route
app.post(
  "/listings",
  validatelisting,
  wrapasync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })
);

// Edit Form Route
app.get(
  "/listings/:id/edit",
  wrapasync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);

// Update Route
app.put(
  "/listings/:id",
  validatelisting,
  wrapasync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  })
);

// Delete Route
app.delete(
  "/listings/:id",
  wrapasync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
  })
);

//Reviews Post route
app.post(
  "/listings/:id/reviews",
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
app.delete(
  "/listings/:id/reviews/:reviewId",
  wrapasync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { review: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
  })
);

//  "*"  -> /(.*)/  updated syntax in express 5
app.all(/(.*)/, (req, res, next) => {
  next(new expressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  let { status = 500, message = "Something went wrong" } = err;
  res.render("error.ejs", { status, message });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
