const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const expressError = require("./utils/expresserror");

const listingroutes = require("./routes/listing.js");
const reviewroutes = require("./routes/reviews.js");
const userroutes = require("./routes/user.js");

const usermodel = require("./models/user.js");

require("dotenv").config();

const app = express();
const port = 8080;
const MONGO_URL = process.env.MONGO_URI;

// Database Connection
async function main() {
  await mongoose.connect(MONGO_URL);
}
main()
  .then(() => console.log("Successfully connected to the database."))
  .catch((err) => console.error("Database connection failed:", err));

// Session Configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || "fallbacksecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // secure only in prod
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

// Set up EJS and views
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(session(sessionConfig));
app.use(flash());

//passport setup
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(usermodel.authenticate()));
passport.serializeUser(usermodel.serializeUser());
passport.deserializeUser(usermodel.deserializeUser());

// Flash message locals
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.failure = req.flash("failure");
  next();
});

// Routes
app.use("/", userroutes);
app.use("/listings", listingroutes);
app.use("/listings/:id/reviews", reviewroutes);

// Root Route
app.get("/", (req, res) => {
  res.cookie("visited", true, { maxAge: 1000 * 60 * 60, httpOnly: true }); // 1 hour
  res.render("home");
});

// Visit Check
app.get("/check", (req, res) => {
  const visited = req.cookies.visited;
  res.send(visited ? "You have visited before." : "First time visit.");
});

// DEMO USER ROUTE — Register a fake user
app.get("/demouser", async (req, res, next) => {
  try {
    const fakeUser = new usermodel({
      email: "demouser@gmail.in",
      username: "demouser",
    });
    const registeredUser = await usermodel.register(fakeUser, "password");
    console.log(registeredUser);
    res.send(registeredUser);
  } catch (err) {
    next(err);
  }
});

// Catch-all for unknown routes
app.all(/(.*)/, (req, res, next) => {
  next(new expressError(404, "Page Not Found"));
});

// Central error handler
app.use((err, req, res, next) => {
  const { status = 500, message = "Something went wrong" } = err;
  console.error(err.stack);
  res.status(status).render("error.ejs", { status, message });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
