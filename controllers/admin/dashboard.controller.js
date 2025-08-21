const ProductCategory = require("../../models/product-category.model");
const Product = require("../../models/product.model");
const ArticleCategory = require("../../models/article-category.model");
const Article = require("../../models/article.model");
const Order = require("../../models/order.model");
const Account = require("../../models/account.model");
const User = require("../../models/user.model");

// [GET] /admin/dashboard
module.exports.dashboard = async (req, res) => {
  const statistic = {
    categoryProduct: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    product: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    categoryArticle: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    article: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    order: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    account: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    user: {
      total: 0,
      active: 0,
      inactive: 0,
    }
  };

  // Lấy thống kê danh mục sản phẩm
  statistic.categoryProduct.total = await ProductCategory.countDocuments({
    deleted: false
  });
  statistic.categoryProduct.active = await ProductCategory.countDocuments({
    deleted: false,
    status: "active"
  });
  statistic.categoryProduct.inactive = await ProductCategory.countDocuments({
    deleted: false,
    status: "inactive"
  });

  // Lấy thống kê sản phẩm
  statistic.product.total = await Product.countDocuments({
    deleted: false
  });
  statistic.product.active = await Product.countDocuments({
    deleted: false,
    status: "active"
  });
  statistic.product.inactive = await Product.countDocuments({
    deleted: false,
    status: "inactive"
  });

  // Lấy thống kê danh mục bài viết
  statistic.categoryArticle.total = await ArticleCategory.countDocuments({
    deleted: false
  });
  statistic.categoryArticle.active = await ArticleCategory.countDocuments({
    deleted: false,
    status: "active"
  });
  statistic.categoryArticle.inactive = await ArticleCategory.countDocuments({
    deleted: false,
    status: "inactive"
  });

  // Lấy thống kê bài viết
  statistic.article.total = await Article.countDocuments({
    deleted: false
  });
  statistic.article.active = await Article.countDocuments({
    deleted: false,
    status: "active"
  });
  statistic.article.inactive = await Article.countDocuments({
    deleted: false,
    status: "inactive"
  });

  // Lấy thống kê đơn hàng
  // statistic.order.total = await Order.countDocuments({
  //   deleted: false
  // });
  // statistic.order.active = await Order.countDocuments({
  //   deleted: false,
  //   status: "active"
  // });
  // statistic.order.inactive = await Order.countDocuments({
  //   deleted: false,
  //   status: "inactive"
  // });

  // Lấy thống kê tài khoản
  statistic.account.total = await Account.countDocuments({
    deleted: false
  });
  statistic.account.active = await Account.countDocuments({
    deleted: false,
    status: "active"
  });
  statistic.account.inactive = await Account.countDocuments({
    deleted: false,
    status: "inactive"
  });

  // Lấy thống kê người dùng
  statistic.user.total = await User.countDocuments({
    deleted: false
  });
  statistic.user.active = await User.countDocuments({
    deleted: false,
    status: "active"
  });
  statistic.user.inactive = await User.countDocuments({
    deleted: false,
    status: "inactive"
  });

  res.render("admin/pages/dashboard/index", {
    pageTitle:"Trang chủ",
    statistic: statistic
  });
} 