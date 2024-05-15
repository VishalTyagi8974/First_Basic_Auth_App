const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/user");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");

mongoose.connect('mongodb://127.0.0.1:27017/firstAuthApp')
    .then(() => console.log("connected to mongoDb"))
    .catch(() => console.log("connection failed to mongoDb"))

const app = express();

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(session({
    secret: "thisIsMySecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
}))

const requireLogin = (req, res, next) => {
    if (req.session.user_id) {
        return next()
    }
    res.redirect("/login");
}

app.get("/secret", requireLogin, (req, res) => {
    res.render("secret");
})
app.get("/topsecret", requireLogin, (req, res) => {
    res.send("topsecret");
})

app.get("/register", (req, res) => {
    res.render("registration")
})

app.get("/login", (req, res) => {
    res.render("login");
})

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findUserAndValidate(username, password);
    if (user) {
        req.session.user_id = user._id;
        res.redirect("/secret");
    } else {
        res.send("incorrect username or password")
    }
})

app.post("/logout", (req, res) => {
    if (req.session.user_id) {
        req.session.user_id = null
        res.redirect("/login")
    } else {
        res.send("something went wrong");
    }
})

app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const user = new User({ username, password })
    await user.save();
    req.session.user_id = user._id;
    res.redirect("/secret");
})
app.listen(3000, () => console.log("listening"));

