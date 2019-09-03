const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
const axios = require('axios');
const cheerio = require('cheerio');

const port = process.env.PORT || 3000;

// Initialize Express
const app = express();

const db = require('./models');


// Use morgan logger for logging requests
app.use(logger('dev'));
// Parse request body as JSON
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
// Make public a static folder
app.use(express.static(__dirname + 'public'));

const exphs = require('express-handlebars');
app.engine('handlebars', exphs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
// Connect to the Mongo DB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/scrapedNews';

mongoose.connect(MONGODB_URI, {useNewUrlParser: true});

app.get("/", (req, res) => {
  db.Article.find({ saved: false })
    .then( dbArticle => {
      res.render("index", {dbArticle})
    })
    .catch( err => {
      if (err) res.json(err);
    })
});

app.get("/all", (req, res) => {
  db.Article.find({})
    .then( dbArticle => {
      res.json(dbArticle)
    })
    .catch( err => {
      if (err) res.json(err)
    })
})

app.get("/scrape", (req, res) => {
  db.Article.remove({}, err => {
    console.log("Articles have been removed")
  });
  axios.get("https://www.pcworld.com/news/").then( response => {
    let $ = cheerio.load(response.data)

    $('.excerpt-text').each(function(i, element) {
      // Save an empty result object
      let result = {};
      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
          .children('.crawl-headline')
          .text()
          .trim();
      result.link = $(this)
          .children('.crawl-headline')
          .children('a')
          .attr('href');
      if (!result.link.includes('https')) {
        result.link = 'https://www.pcworld.com' + result.link;
      }
      result.summary = $(this)
          .children('.crawl-summary')
          .text()
          .trim();

      db.Article.create(result)
        .then( dbArticle => {})
        .catch( err => {
          if (err) res.json(err)
        });
    });
    res.redirect("/")
  });
});

app.post("/save/:id", (req, res) => {
  db.Article.findOneAndUpdate({
    _id: req.params.id
  }, {
    saved: true
  })
  .then( dbArticle => {
    res.redirect("/")
  })
  .catch( err => {
    if (err) res.json(err);
  })
})

app.post("/delete/:id", (req, res) => {
  db.Article.findOneAndUpdate({
    _id: req.params.id
  }, {
    saved: false
  })
  .then( dbArticle => {
    res.redirect("/savedarticles")
  })
  .catch( err => {
    if (err) res.json(err);
  })
})

app.get("/savedarticles", (req, res) => {
  db.Article.find({ saved: true })
    .then( dbArticle => {
      res.render("article", {dbArticle})
    })
    .catch( err => {
      if (err) res.json(err)
    })
})
// Start the server
app.listen(port, function() {
  console.log('App running on port ' + port + '!');
});
