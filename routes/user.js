const express = require("express");
const router = express.Router();
const usermodel = require("../models/user");
const wrapasync = require("../utils/wrapasync");

router.get("/signup", (req, res) => {
  res.render("user/signup");
});

router.post(
  "/signup",
  wrapasync(async (req, res, next) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      req.flash("error", "All fields are required.");
      return res.redirect("/signup");
    }

    try {
      const newUser = new usermodel({ email, username });
      const registeredUser = await usermodel.register(newUser, password);

      req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Welcome!");
        res.redirect("/listings");
      });
    } catch (e) {
      req.flash("failure", e.message);
      res.redirect("/signup");
    }
  })
);

module.exports = router;
