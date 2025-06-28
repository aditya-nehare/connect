const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const Listing = require("./models/listing");

const app = express();
const port = 8080;

const MONGO_URL = "mongodb://127.0.0.1:27017/connect";

main()
  .then(() => {
    console.log("connected to database ");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.get("/", (req, res) => {
  res.send("hi i am root api ");
});

app.get("/listing", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("index.ejs", { allListings });
});

// app.get("/testlisting", async (req, res) => {
//   let samplelisting = new Listing({
//     title: "A",
//     description: " B",
//     price: 3,
//     location: "C",
//   });

//   await samplelisting.save();
//   console.log("listing saved");
//   res.send("sample listing saved successfull");
// });

app.listen(port, () => {
  console.log("server is running on port " + port);
});
