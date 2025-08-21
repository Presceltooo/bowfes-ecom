// Category of Products

const ProductCategory = require("../../models/product-category.model");
const ArticleCategory = require("../../models/article-category.model");
const createTreeHelper = require("../../helpers/createTree");


module.exports.categoryProducts = async (req, res, next) => {
  const productsCategory = await ProductCategory.find({
    deleted: false
  });

  const newProductsCategory = createTreeHelper.tree(productsCategory);

  res.locals.layoutProductsCategory = newProductsCategory;
  // Tạo biến cục bộ để sử dụng trong layout

  next();
}
// End Category of Products

// Category of Articles
module.exports.categoryArticles = async (req, res, next) => {
  const articlesCategory = await ArticleCategory.find({
    deleted: false
  });

  const newArticlesCategory = createTreeHelper.tree(articlesCategory);

  res.locals.layoutArticlesCategory = newArticlesCategory;
  // Tạo biến cục bộ để sử dụng trong layout

  next();
}

// End Category of Articles