const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");

const expressError = require("./utils/expresserror");

const listingroutes = require("./routes/listing.js");
const reviewroutes = require("./routes/reviews.js");

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

app.use(cookieParser());

// Set up EJS and views
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public"))); // For static files

const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true, // Uncomment if using HTTPS in production
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

// Routes
app.get("/", (req, res) => {
  res.cookie("visited", true, { maxAge: 1000 * 60 * 60, httpOnly: true }); // expires in 1 hour
  res.send("Welcome to the root API.");
});

app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.failure = req.flash("failure");
  next();
});

app.get("/check", (req, res) => {
  const visited = req.cookies.visited;
  if (visited) {
    res.send("You have visited before.");
  } else {
    res.send("First time visit.");
  }
});

app.use("/listings", listingroutes);
app.use("/listings/:id/reviews", reviewroutes);

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
