const mongoose = require('mongoose');

// Save a reference to the Schema constructor
const Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
const ArticleSchema = new Schema({

  title: {
    type: String,
    required: true,
  },

  link: {
    type: String,
    required: true,
  },

  summary: {
    type: String,
  },

  saved: {
    type: Boolean,
    default: false,
    required: true
  },

  note: [{
    type: Schema.Types.ObjectId,
    ref: 'Note',
  }],
});

const Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;
