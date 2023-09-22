if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// SESSION_SECRET = hmalkjf65413
// DATABASE_URL = mongodb+srv://hanish:world.this@clusters.1dvhs69.mongodb.net/kalayolam?retryWrites=true&w=majority

const express = require("express");
const app = express();
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const db = require("./config/db");
const User = require("./models/users");
const expressLayouts = require("express-ejs-layouts");

const indexRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
const authRouter = require('./routes/auth')
const public_portal = require('./routes/public')
const validator = require('./routes/validator')

db();

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use('/public', express.static('./public'))

app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(methodOverride("_method"));

// Middleware to protect admin route
const authenticateAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next(); // User is authenticated and is an admin, proceed to the next middleware or route handler
  }
  res.redirect("/login"); // User is not authenticated or is not an admin, redirect to the login page
};
const authenticateUser = (req, res, next) => {
  if (req.isAuthenticated() && req.user) {
    return next(); // User is authenticated and is an admin, proceed to the next middleware or route handler
  }
  res.redirect("/login"); // User is not authenticated or is not an admin, redirect to the login page
};

app.use("/", authRouter)
app.use("/",indexRouter);
app.use("/admin", adminRouter);
app.use('/public_portal', public_portal)
app.use('/validator', validator)

const PORT = process.env.PORT || 6040;
app.listen(PORT, () => console.log("Server is up and running on port " + PORT));