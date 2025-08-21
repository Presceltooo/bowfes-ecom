const Product = require("../../models/product.model");

const productHelper = require("../../helpers/products");

// [GET] /
module.exports.index = async (req, res) => {
  // Lấy ra sản phẩm nổi bật
  const productsFeatured = await Product.find({
    featured: "1",
    deleted: false,
    status: "active"
  }).limit(6);

  const newProductsFeatured = productHelper.priceNewProducts(productsFeatured);
  // End Lấy ra sản phẩm nổi bật

  // Lấy ra danh sách sản phẩm mới nhất
  const productNew = await Product.find({
    deleted: false,
    status: "active"
  }).sort({ position: "desc" }).limit(6);

  const newProductsNew = productHelper.priceNewProducts(productNew);
  // End Lấy ra danh sách sản phẩm mới nhất

  res.render("client/pages/home/index", {
    pageTitle: "Trang chủ",
    productsFeatured: newProductsFeatured,
    productsNew: newProductsNew
  });
}