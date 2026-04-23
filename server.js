require("dotenv").config();

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const MongoStore = require("connect-mongo").default;
const cors = require('cors');
const connectDB = require("./config/db");
const backendRoute = require("./routes/backend")
const apiRoute = require("./routes/api")

const app = express();
connectDB();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

/* ---------- Middleware ---------- */
app.use(express.urlencoded({extended:true}));
app.use(express.json());

/* ---------- Static Files ---------- */
app.use(express.static(path.join(__dirname, "public")));

/* ---------- EJS Setup ---------- */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(expressLayouts);
app.set("layout", "layout/main");

/* ---------- Session Setup ---------- */
app.use(
  session({
    secret: "adminSecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
    cookie: {
      secure: false, // true in production (https)
      httpOnly: true,
      sameSite: "lax",
    },
  })
);
/* ---------- Flash ---------- */
app.use(flash());

/* ✅ GLOBAL FLASH VARIABLES (MUST BE BEFORE ROUTES) */
app.use((req, res, next) => {
//  res.locals.script = "";
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.warning = req.flash("warning");
    res.locals.info = req.flash("info");
    next();
});

/* ---------- Routes ---------- */
app.use("/", backendRoute);
app.use("/api", apiRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});