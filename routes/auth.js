const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/users");

// Index Route
router.get("/", (req, res, next) => {
  res.render("index.ejs");
});

router.get("/home", async (req, res) => {
  const userMainContentPath = '../partials/user/main.ejs';
try {
  if (!req.user.isAdmin  && !req.user.isEvaluator) {
    res.render("USER/home.ejs", { name: req.user.name , userMainContentPath});
  } else if (req.user.isEvaluator  && !req.user.isAdmin ){
    res.redirect("/validator");
  } else if (req.user.isAdmin){
    res.redirect('/admin')
  }
} catch (error) {
  res.redirect('/login')
}
  
});

// const ensureAuthenticated = (req, res, next) => {
//   if (req.isAuthenticated()) {
//     return next(); // User is authenticated, proceed to next middleware or route handler
//   }
//   res.redirect("/login"); // User is not authenticated, redirect to login page
// };

// Login Route
router.get("/login",  (req, res) => {
  res.render("login.ejs");
});


router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/home",
    keepSessionInfo: true,
    failureRedirect: "/login",
    failureFlash: true,
  })
);

router.get("/register", (req, res) => {
  res.render("register.ejs");
});

router.post("/register", async (req, res) => {
  User.register(
    {
      name: req.body.name,
      email: req.body.email,
    },
    req.body.password,
    async function (err, user) {
      if (err) {
        console.log(err);
        req.flash("message", "User Already registered");
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/login");
        });
      }
    }
  );
});

router.post("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
    }
  });
});


// Login, Register and Logout Routes - END
module.exports = router