const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");

const productHelper = require("../../helpers/products");
const productCategoryHelper = require("../../helpers/products-category");

// [GET] /products
module.exports.index = async (req, res) => {
  const products = await Product.find({
    status: "active",
    deleted: false
  }).sort({ position: "desc" });

  // map() sẽ tạo ra 1 mảng mới từ mảng cũ và có tướng tác với từng phần tử trong mảng cũ
  const newProducts = productHelper.priceNewProducts(products);

  res.render("client/pages/products/index", {
    pageTitle: "Trang danh sách sản phẩm",
    products: newProducts
  });
};

// [GET] /products/:slugProduct 
module.exports.detail = async (req, res) => {
  try {
    const find = {
      deleted: false,
      slug: req.params.slugProduct,
      status: "active"
    }

    const product = await Product.findOne(find);

    if (product.product_category_id) {
      const category = await ProductCategory.findOne({
        _id: product.product_category_id,
        status: "active",
        deleted: false
      });

      product.category = category;
    }

    product.newPrice = productHelper.priceNewProduct(product);

    res.render("client/pages/products/detail", {
      pageTitle: product.title,
      product: product
    });
  } catch (error) {
    res.redirect(`/products`);
  }

};

// [GET] /products/:slugCategory
module.exports.category = async (req, res) => {
  try {
    const category = await ProductCategory.findOne({
      slug: req.params.slugCategory,
      status: "active",
      deleted: false
    })

    const listSubCategory = await productCategoryHelper.getSubCategory(category.id);

    const listSubCategoryId = listSubCategory.map(item => item.id);

    const products = await Product.find({
      product_category_id: { $in: [category.id, ...listSubCategoryId] },
    }).sort({ sort: "desc" });

    const newProducts = productHelper.priceNewProducts(products);

    res.render("client/pages/products/index", {
      pageTitle: category.title,
      products: newProducts
    });
  } catch (error) {
    res.redirect(`/products`);
  }
};