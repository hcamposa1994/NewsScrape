const db = require('../models');
const axios = require("axios");
const cheerio = require("cheerio");
const mongoose = require("mongoose");

module.exports = (app) => {
  // Routes
  app.get('/', (req, res) => {
    db.Article.find({}).limit(10)
    .then( dbArticle => {
        res.render('index', {dbArticle})
    })
  });
  // A GET route for scraping the echoJS website
  app.get('/scrape', function(req, res) {
    // First, we grab the body of the html with axios
    axios.get('https://www.pcworld.com/news/').then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      const $ = cheerio.load(response.data);
      // Now, we grab every h2 within an article tag, and do the following:
      $('.excerpt-text').each(function(i, element) {
        // Save an empty result object
        const result = {};
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
          result.link = 'https://www.pcworld.com/news' + result.link;
        }

        result.summary = $(this)
            .children('.crawl-summary')
            .text()
            .trim();

        // Create a new Article using the `result` object built from scraping
        db.Article.create(result)
            .then(function(dbArticle) {
            // View the added result in the console
              res.redirect('/')
            })
            .catch(function(err) {
            // If an error occurred, log it
              console.log(err);
            });
      });
    });
  });

  // Route for getting all Articles from the db
  app.get('/articles', function(req, res) {
    // TODO: Finish the route so it grabs all of the articles
    db.Article.find({})
        .then( (dbArticle) => {
          res.json(dbArticle);
        })
        .catch( (err) => {
          res.json(err);
        });
  });

  // Route for grabbing a specific Article by id, populate it with it's note
  app.get('/articles/:id', function(req, res) {
    // TODO
    // ====
    // Finish the route so it finds one article using the req.params.id,
    // and run the populate method with "note",
    // then responds with the article with the note included
    db.Article.findOne({
      _id: req.params.id,
    })
        .populate('note')
        .then( (dbArticle) => {
          res.json(dbArticle);
        })
        .catch( (err) => {
          res.json(err);
        });
  });

  // Route for saving/updating an Article's associated Note
  app.post('/articles/:id', function(req, res) {
    // TODO
    // ====
    // save the new note that gets posted to the Notes collection
    // then find an article from the req.params.id
    // and update it's "note" property with the _id of the new note
    db.Note.create(req.body)
        .then( (dbNote) => {
          return db.Article.findOneAndUpdate({_id: req.params.id}, {note: dbNote._id}, {new: true});
        })
        .then( (dbArticle) => {
          res.json(dbArticle);
        })
        .catch( (err) => {
          res.json(err);
        });
  });
};
