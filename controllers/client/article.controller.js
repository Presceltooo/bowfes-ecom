const Article = require("../../models/article.model");
const ArticleCategory = require("../../models/article-category.model");

const articleCategoryHelper = require("../../helpers/articles-category");

// [GET] /articles
module.exports.index = async (req, res) => {
  const products = await Article.find({
    status: "active",
    deleted: false
  }).sort({
    position: "desc"
  });

  res.render("client/pages/articles/index", {
    pageTitle: "Trang danh sách bài viết",
    products: products
  });
};

// [GET] /articles/detail/:slugArticle
module.exports.detail = async (req, res) => {
  try {
    const find = {
      deleted: false,
      slug: req.params.slugArticle,
      status: "active"
    }

    const article = await Article.findOne(find);

    if (article.article_category_id) {
      const category = await ArticleCategory.findOne({
        _id: article.article_category_id,
        status: "active",
        deleted: false
      });

      article.category = category.title;
    }

    res.render("client/pages/articles/detail", {
      pageTitle: article.title,
      product: article
    });
  } catch (error) {
    res.redirect(`/articles`);
  }

};

// [GET] /articles/:slugCategory
module.exports.category = async (req, res) => {
  try {
    const category = await ArticleCategory.findOne({
      slug: req.params.slugCategory,
      status: "active",
      deleted: false
    })

    const listSubCategory = await articleCategoryHelper.getSubCategory(category.id);

    const listSubCategoryId = listSubCategory.map(item => item.id);

    const articles = await Article.find({
      article_category_id: {
        $in: [category.id, ...listSubCategoryId]
      },
    }).sort({
      sort: "desc"
    });

    res.render("client/pages/articles/index", {
      pageTitle: category.title,
      products: articles
    });
  } catch (error) {
    res.redirect(`/articles`);
  }
};