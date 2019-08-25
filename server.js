const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const bodyParser = require("body-parser")
// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
const axios = require("axios");
const cheerio = require("cheerio");

const port = process.env.PORT || 3000;

// Initialize Express
const app = express();

const db = require("./models")


// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Make public a static folder
app.use(express.static("public"));

const exphs = require("express-handlebars");
app.engine("handlebars", exphs({ defaultLayout: "main"}));
app.set("view engine", "handlebars");
// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/scrapedNews", { useNewUrlParser: true });

require("./controller/scrape_controller")(app)


// Start the server
app.listen(port, function() {
  console.log("App running on port " + port + "!");
});
