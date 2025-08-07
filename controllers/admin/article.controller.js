const Article = require("../../models/article.model");
const Account = require("../../models/account.model");
const ArticleCategory = require("../../models/article-category.model");
const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const SystemConfig = require("../../config/system.js");
const createTreeHelper = require("../../helpers/createTree");

// [GET] /admin/articles
module.exports.index = async (req, res) => {
  filterStatus = filterStatusHelper(req.query);

  let find = {
    $or: [{
      deleted: false
    }, { 
      // Lưu ý dùng deletedBy.deletedAt / deletedBy: {deletedAt}
      'deletedBy.deletedAt': {
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
  const countProducts = await Article.countDocuments(find);
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

  const products = await Article.find(find)
    .sort(sort)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

  for (const product of products) {
    // Lấy ra thông tin của người tạo bài viết
    const user = await Account.findOne({
      _id: product.createdBy.account_id
    })

    if (user) {
      product.accountFullName = user.fullName
    }

    // Lấy ra thông tin của người cập nhật bài viết gần nhất
    const updatedBy = product.updatedBy.slice(-1)[0];
    
    if (updatedBy) {
      const userUpdated = await Account.findOne({
        _id: updatedBy.account_id
      })

      updatedBy.accountFullName = userUpdated.fullName;
    }
  }

  res.render("admin/pages/articles/index", {
    pageTitle: "Trang danh sách bài viết",
    products: products,
    filterStatus: filterStatus,
    keyword: objectSearch.keyword,
    pagination: objectPagination
  });
}

// [PATCH] /admin/products/change-status/:change-status/:id
module.exports.changeStatus = async (req, res) => {
  const permissions = res.locals.role.permissions;

  if (permissions.includes("articles_edit")) {
    const status = req.params.status;
    const id = req.params.id;

    const updatedBy = {
      account_id: res.locals.user.id,
      updatedAt: Date.now()
    };

    await Article.updateOne({
      _id: id
    }, {
      status: status,
    $push: { updatedBy: updatedBy }
    });
    req.flash('success', 'Cập nhật trạng thái bài viết thành công!');

    res.redirect('back');
  } else {
    res.send("403");
    return;
  }
}

// [PATCH] /admin/products/change-multi
module.exports.changeMulti = async (req, res) => {
  const permissions = res.locals.role.permissions;

  if (permissions.includes("articles_edit")) {
    const type = req.body.type;
    const ids = req.body.ids.split(", "); // chuyển thành mảng

    const updatedBy = {
      account_id: res.locals.user.id,
      updatedAt: Date.now()
    };

    switch (type) {
      case "active":
        await Article.updateMany({
          _id: {
            $in: ids
          }
        }, {
          status: "active",
        $push: { updatedBy: updatedBy }
        });
        req.flash('success', `Cập nhật trạng thái thành công ${ids.length} bài viết!`);
        break;
      case "inactive":
        await Article.updateMany({
          _id: {
            $in: ids
          }
        }, {
          status: "inactive",
        $push: { updatedBy: updatedBy }
        });
        req.flash('success', `Dừng hoạt động thành công ${ids.length} bài viết!`);
        break;
      case "delete-all":
        await Article.updateMany({
          _id: {
            $in: ids
          }
        }, {
          deleted: true,
          status: "inactive",
          deletedBy: {
            account_id: res.locals.user.id,
            deletedAt: Date.now()
          }
        });
        req.flash('success', `Xóa thành công ${ids.length} bài viết!`);
        break;
      case "restore-all":
        await Article.updateMany({
          _id: {
            $in: ids
          }
        }, {
          deleted: false,
          status: "active",
          deletedBy: {
            account_id: null,
            deletedAt: null
          }
        });
        req.flash('success', `Khôi phục thành công ${ids.length} bài viết!`);
        break;
      case "change-position":
        for (const item of ids) {
          let [id, position] = item.split("-");
          position = parseInt(position);

          await Article.updateOne({
            _id: id
          }, {
            position: position,
          $push: { updatedBy: updatedBy }
          });
        }
        req.flash('success', `Cập nhật thành công vị trí ${ids.length} bài viết!`);
        break;
      default:
        break;
    }

    res.redirect('back');
  } else {
    res.send("403");
    return;
  }
}

// [DELETE] /admin/articles/delete/:id
module.exports.deleteItem = async (req, res) => {
  const permissions = res.locals.role.permissions;

  if (permissions.includes("articles_delete")) {
    const id = req.params.id;

    // await Product.deleteOne({_id: id});
    await Article.updateOne({
      _id: id
    }, {
      deleted: true,
      status: "inactive",
      deletedBy: {
        account_id: res.locals.user.id,
        deletedAt: Date.now()
      }
    });
    req.flash('success', `Xóa thành công bài viết!`);

    res.redirect('back');
  } else {
    res.send("403");
    return;
  }
}

// [PATCH] /admin/articles/restore/:id
module.exports.restoreItem = async (req, res) => {
  const permissions = res.locals.role.permissions;

  if (permissions.includes("articles_delete")) {
    const id = req.params.id;

    // await Product.deleteOne({_id: id});
    await Article.updateOne({
      _id: id
    }, {
      deleted: false,
      status: "active",
      deletedBy: {
        account_id: null,
        deletedAt: null
      }
    });
    req.flash('success', `Khôi phục thành công bài viết!`);

    res.redirect('back');
  } else {
    res.send("403");
    return;
  }
}

// [GET] /admin/articles/create
module.exports.create = async (req, res) => {
  find = {
    $or: [{
      deleted: false
    }, {
      'deletedBy.deletedAt': {
          $ne: null
        }
    }]
  }; 
  
  const records = await ArticleCategory.find(find);

  const category = createTreeHelper.tree(records);

  res.render("admin/pages/articles/create", {
    pageTitle: "Thêm mới bài viết",
    category: category,
  });
}

// [POST] /admin/articles/create
module.exports.createPost = async (req, res) => {
  const permissions = res.locals.role.permissions;

  if (permissions.includes("articles_create")) {

    if (req.body.position == NaN || req.body.position == '') {
      const countProducts = await Article.countDocuments();
      req.body.position = countProducts + 1;
    } else {
      req.body.position = parseInt(req.body.position);
    }

    req.body.createdBy = {
      account_id: res.locals.user.id
    }

    const product = new Article(req.body);
    await product.save();

    res.redirect(`${SystemConfig.preFixAdmin}/articles`);
  } else {
    res.send("403");
    return;
  }
};

// [GET] /admin/articles/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const findone = {
      deleted: false,
      _id: req.params.id
    }

    const product = await Article.findOne(findone);

    find = {
      $or: [{
        deleted: false
      }, {
        'deletedBy.deletedAt': {
            $ne: null
          }
      }]
    };

    const records = await ArticleCategory.find(find);

    const category = createTreeHelper.tree(records);

    res.render("admin/pages/articles/edit", {
      pageTitle: "Chỉnh sửa bài viết",
      product: product,
      category: category,
    });
  }
  catch (error) {
    res.redirect(`${SystemConfig.preFixAdmin}/articles`);
  }

}

// [PATCH] /admin/articles/edit/:id
module.exports.editPatch = async (req, res) => {
  const permissions = res.locals.role.permissions;

  if (permissions.includes("products_edit")) {
    const id = req.params.id;

    req.body.position = parseInt(req.body.position);

    try {
      const updatedBy = {
        account_id: res.locals.user.id,
        updatedAt: Date.now()
      };

    await Article.updateOne({ _id: id }, {
        ...req.body,
      $push: { updatedBy: updatedBy }
      });
      // ...req.body để lấy ra các phần tử trong body, $push để thêm vào mảng updatedBy

      req.flash('success', 'Cập nhật bài viết thành công!');
    } catch (error) {
      req.flash('error', 'Cập nhật bài viết thất bại!');
    }

    res.redirect("back");
  } else {
    res.send("403");
    return;
  }
};

// [GET] /admin/articles/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const findone = {
      deleted: false,
      _id: req.params.id
    }

    const product = await Article.findOne(findone);

    find = {
      $or: [{
        deleted: false
      }, {
        'deletedBy.deletedAt': {
          $ne: null
        }
      }]
    };
    
    const records = await ArticleCategory.find(find);

    res.render("admin/pages/articles/detail", {
      pageTitle:  product.title,
      product: product,
      category: records
    });
  } catch (error) {
    res.redirect(`${SystemConfig.preFixAdmin}/articles`);
  }

}