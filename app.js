const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const Listing = require("./models/listing");

const app = express();
const port = 8080;

const MONGO_URL = "mongodb://127.0.0.1:27017/connect";

// Database connection
main()
  .then(() => {
    console.log("Successfully connected to the database.");
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public"))); //for satic file

app.engine("ejs", ejsMate);

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the root API.");
});

//Index Route
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

//Add-new-listing Route
app.get("/listing/new", async (req, res) => {
  res.render("listings/addNew.ejs");
});

//Show Route
app.get("/listing/:id", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
});

//New Listing
app.post("/listings", async (req, res) => {
  let listing = req.body.listing;
  const newListing = new Listing(listing);
  await newListing.save();
  console.log(newListing);
  res.redirect("/listings");
});

//Edit Route
app.get("/listing/:id/edit", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});

//Update Route
app.put("/listing/:id", async (req, res) => {
  let { id } = req.params;
  const updatedListing = await Listing.findByIdAndUpdate(id, {
    ...req.body.listing,
  });
  console.log(updatedListing);
  res.redirect(`/listing/${id}`);
});

//Delete Route
app.delete("/listing/:id", async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
