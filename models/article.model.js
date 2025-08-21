const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');

mongoose.plugin(slug);

// Schema như là 1 khung
const articleSchema = new mongoose.Schema({
  title: String,
  article_category_id: {
    type: String,
    default: ""
  },
  description: String,
  category: String,
  rating: Number,
  thumbnail: String,
  slug: {
    type: String,
    slug: "title",
    unique: true
  },
  createdBy: {
    account_id: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  deleted: {
    type: Boolean,
    default: false
  },
  position: Number,
  status: String,
  featured: String,
  deletedBy: {
    account_id: String,
    deletedAt: Date
  },
  updatedBy: [
    {
      account_id: String,
      updatedAt: Date
    }
  ],
}, {
  timestamps: true
});

const Article = mongoose.model('Article', articleSchema, "articles");
// Model là 1 bản ghi: gồm tên model, schema và tên collection

module.exports = Article;