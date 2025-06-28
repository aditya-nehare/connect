const mongoose = require("mongoose");
const data = require("./data");
const listing = require("../models/listing");

const MONGO_URL = "mongodb://127.0.0.1:27017/connect";

main()
  .then(() => {
    console.log("connected to database");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await listing.deleteMany({});
  await listing.insertMany(data.data); //This deletes all existing listings and populates the collection with new entries
  console.log("data was initialized");
};

initDB();
