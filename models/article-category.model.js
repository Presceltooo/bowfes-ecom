const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');

mongoose.plugin(slug);

// Schema như là 1 khung
const articleCategorySchema = new mongoose.Schema({
  title: String,
  parent_id: {
    type: String,
    default: ""
  },
  description: String,
  thumbnail: String,
  slug: {
    type: String,
    slug: "title",
    unique: true
  },
  deleted: {
    type: Boolean,
    default: false
  },
  position: Number,
  status: String,
  deletedAt: Date,
  updatedBy: [{
    account_id: String,
    updatedAt: Date
  }],
}, {
  timestamps: true
});

const ArticleCategory = mongoose.model('ArticleCategory', articleCategorySchema, "articles-category");
// Model là 1 bản ghi: gồm tên model, schema và tên collection

module.exports = ArticleCategory;