const ProductCategory = require("../../models/product-category.model");
const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const SystemConfig = require("../../config/system.js");

// [GET] /admin/products-category
module.exports.index = async (req, res) => {
  filterStatus = filterStatusHelper(req.query);

  let find = {
    $or: [{
      deleted: false
    }, {
      deletedAt: {
        $ne: null
      }
    }]
  };

  if (req.query.status) {
    find.status = req.query.status;
  };

  // Search
  const objectSearch = searchHelper(req.query);

  if (objectSearch.regex) {
    find.title = objectSearch.regex;
  }
  // End Search

  // Pagination
  const countProducts = await ProductCategory.countDocuments(find);
  let objectPagination = paginationHelper({
      currentPage: 1,
      limitItems: 4
    },
    req.query,
    countProducts
  );

  // End Pagination

  // Sort
  let sort = {}

  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;

  } else {
    sort.position = "desc";
  }
  // End Sort

  const records = await ProductCategory.find(find)
        .sort(sort)
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip);

  res.render("admin/pages/products-category/index", {
    pageTitle: "Danh mục sản phẩm",
    records: records,
    filterStatus: filterStatus,
    keyword: objectSearch.keyword,
    pagination: objectPagination
  });
}

// [PATCH] /admin/products-category/change-status/:change-status/:id
module.exports.changeStatus = async (req, res) => {
  const status = req.params.status;
  const id = req.params.id;

  await ProductCategory.updateOne({
    _id: id
  }, {
    status: status
  });
  req.flash('success', 'Cập nhật trạng thái danh mục thành công!');

  res.redirect('back');
}

// [PATCH] /admin/products-category/change-multi
module.exports.changeMulti = async (req, res) => {
  const type = req.body.type;
  const ids = req.body.ids.split(", "); // chuyển thành mảng

  switch (type) {
    case "active":
      await ProductCategory.updateMany({
        _id: {
          $in: ids
        }
      }, {
        status: "active"
      });
      req.flash('success', `Cập nhật trạng thái thành công ${ids.length} danh mục!`);
      break;
    case "inactive":
      await ProductCategory.updateMany({
        _id: {
          $in: ids
        }
      }, {
        status: "inactive"
      });
      req.flash('success', `Dừng hoạt động thành công ${ids.length} danh mục!`);
      break;
    case "delete-all":
      await ProductCategory.updateMany({
        _id: {
          $in: ids
        }
      }, {
        deleted: true,
        status: "inactive",
        deletedAt: Date.now()
      });
      req.flash('success', `Xóa thành công ${ids.length} danh mục!`);
      break;
    case "restore-all":
      await ProductCategory.updateMany({
        _id: {
          $in: ids
        }
      }, {
        deleted: false,
        status: "active",
        deletedAt: null
      });
      req.flash('success', `Khôi phục thành công ${ids.length} danh mục!`);
      break;
    case "change-position":
      for (const item of ids) {
        let [id, position] = item.split("-");
        position = parseInt(position);

        await ProductCategory.updateOne({
          _id: id
        }, {
          position: position
        });
      }
      req.flash('success', `Cập nhật thành công vị trí ${ids.length} danh mục!`);
      break;
    default:
      break;
  }

  res.redirect('back');
}

// [DELETE] /admin/products-category/delete/:id
module.exports.deleteItem = async (req, res) => {
  const id = req.params.id;

  // await Product.deleteOne({_id: id});
  await ProductCategory.updateOne({
    _id: id
  }, {
    deleted: true,
    status: "inactive",
    deletedAt: Date.now()
  });
  req.flash('success', `Xóa thành công danh mục!`);

  res.redirect('back');
}

// [PATCH] /admin/products-category/restore/:id
module.exports.restoreItem = async (req, res) => {
  const id = req.params.id;

  // await Product.deleteOne({_id: id});
  await ProductCategory.updateOne({
    _id: id
  }, {
    deleted: false,
    status: "active",
    deletedAt: null
  });
  req.flash('success', `Khôi phục thành công danh mục!`);

  res.redirect('back');
}

// [GET] /admin/products-category/create
module.exports.create = async (req, res) => {
  res.render("admin/pages/products-category/create", {
    pageTitle: "Tạo danh mục sản phẩm"
  });
}

// [POST] /admin/products-category/create
module.exports.createPost = async (req, res) => {
  if (req.body.position == NaN || req.body.position == '') {
    const count = await ProductCategory.countDocuments();
    req.body.position = count + 1;
  } else {
    req.body.position = parseInt(req.body.position);
  }

  const record = new ProductCategory(req.body);
  await record.save();

  res.redirect(`${SystemConfig.preFixAdmin}/products-category`);
};

// [GET] /admin/products-category/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id
    }

    const records = await ProductCategory.findOne(find);

    res.render("admin/pages/products-category/edit", {
      pageTitle: "Chỉnh sửa danh mục",
      records: records
    });
  } catch (error) {
    res.redirect(`${SystemConfig.preFixAdmin}/products-category`);
  }

}

// [PATCH] /admin/products-category/edit/:id
module.exports.editPatch = async (req, res) => {
  const id = req.params.id;

  req.body.position = parseInt(req.body.position);

  try {
    await ProductCategory.updateOne({
      _id: id
    }, req.body);
    req.flash('success', 'Cập nhật danh mục thành công!');
  } catch (error) {
    req.flash('error', 'Cập nhật danh mục thất bại!');
  }

  res.redirect("back");
};

// [GET] /admin/products-category/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id
    }

    const records = await ProductCategory.findOne(find);

    res.render("admin/pages/products-category/detail", {
      pageTitle: records.title,
      records: records
    });
  } catch (error) {
    res.redirect(`${SystemConfig.preFixAdmin}/products-category`);
  }

}