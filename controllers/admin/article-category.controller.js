const ArticleCategory = require("../../models/article-category.model");
const Account = require("../../models/account.model");
const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const SystemConfig = require("../../config/system.js");
const createTreeHelper = require("../../helpers/createTree");

// [GET] /admin/articles-category
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
  const countArticles = await ArticleCategory.countDocuments(find);
  let objectPagination = paginationHelper({
      currentPage: 1,
      limitItems: 4
    },
    req.query,
    countArticles
  );

  // End Pagination

  // Sort
  let sort = {}

  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;

  } else {
    sort.position = "asc";
  }
  // End Sort

  const records = await ArticleCategory.find(find)
        .sort(sort)
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip);

  const newRecords = createTreeHelper.tree(records);

  for (const record of records) {
    // Lấy ra thông tin của người cập nhật sản phẩm gần nhất
    const updatedBy = record.updatedBy.slice(-1)[0];

    if (updatedBy) {
      const userUpdated = await Account.findOne({
        _id: updatedBy.account_id
      })

      updatedBy.accountFullName = userUpdated.fullName;
    }
  }

  let path = req.baseUrl + req.path;

  if (path.includes("products-category")) {
    path = "products-category";
  }

  res.render("admin/pages/articles-category/index", {
    pageTitle: "Danh mục bài viết",
    records: newRecords,
    filterStatus: filterStatus,
    keyword: objectSearch.keyword,
    pagination: objectPagination,
    path: path
  });
}

// [PATCH] /admin/articles-category/change-status/:change-status/:id
module.exports.changeStatus = async (req, res) => {
  const permissions = res.locals.role.permissions;

  if (permissions.includes("articles-category_edit")) { 
    const status = req.params.status;
    const id = req.params.id;

    const updatedBy = {
      account_id: res.locals.user.id,
      updatedAt: Date.now()
    };

    await ArticleCategory.updateOne({
      _id: id
    }, {
      status: status,
      $push: { updatedBy: updatedBy }
    });
    req.flash('success', 'Cập nhật trạng thái danh mục thành công!');

    res.redirect('back');
  } else {
    res.send("403");
    return;
  }
}

// [PATCH] /admin/articles-category/change-multi
module.exports.changeMulti = async (req, res) => {
  const permissions = res.locals.role.permissions;

  if (permissions.includes("articles-category_edit")) {
    const type = req.body.type;
    const ids = req.body.ids.split(", "); // chuyển thành 

    const updatedBy = {
      account_id: res.locals.user.id,
      updatedAt: Date.now()
    };

    switch (type) {
      case "active":
        await ArticleCategory.updateMany({
          _id: {
            $in: ids
          }
        }, {
          status: "active",
          $push: { updatedBy: updatedBy }
        });
        req.flash('success', `Cập nhật trạng thái thành công ${ids.length} danh mục!`);
        break;
      case "inactive":
        await ArticleCategory.updateMany({
          _id: {
            $in: ids
          }
        }, {
          status: "inactive",
          $push: { updatedBy: updatedBy }
        });
        req.flash('success', `Dừng hoạt động thành công ${ids.length} danh mục!`);
        break;
      case "delete-all":
        await ArticleCategory.updateMany({
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
        await ArticleCategory.updateMany({
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

          await ArticleCategory.updateOne({
            _id: id
          }, {
            position: position,
            $push: { updatedBy: updatedBy }
          });
        }
        req.flash('success', `Cập nhật thành công vị trí ${ids.length} danh mục!`);
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

// [DELETE] /admin/articles-category/delete/:id
module.exports.deleteItem = async (req, res) => {
  const permissions = res.locals.role.permissions;

  if (permissions.includes("articles-category_delete")) {
    const id = req.params.id;

    // await Product.deleteOne({_id: id});
    await ArticleCategory.updateOne({
      _id: id
    }, {
      deleted: true,
      status: "inactive",
      deletedAt: Date.now()
    });
    req.flash('success', `Xóa thành công danh mục!`);

    res.redirect('back');
  } else {
    res.send("403");
    return;
  }
}

// [PATCH] /admin/articles-category/restore/:id
module.exports.restoreItem = async (req, res) => {
  const permissions = res.locals.role.permissions;

  if (permissions.includes("articles-category_delete")) {
    const id = req.params.id;

    await ArticleCategory.updateOne({
      _id: id
    }, {
      deleted: false,
      status: "active",
      deletedAt: null
    });
    req.flash('success', `Khôi phục thành công danh mục!`);

    res.redirect('back');
  } else {
    res.send("403");
    return;
  }
}

// [GET] /admin/articles-category/create
module.exports.create = async (req, res) => {
  find = {
    $or: [{
      deleted: false
    }, {
      deletedAt: {
        $ne: null
      }
    }]
  }; 

  const records = await ArticleCategory.find(find);

  const newRecords = createTreeHelper.tree(records);
  
  res.render("admin/pages/articles-category/create", {
    pageTitle: "Tạo danh mục bài viết",
    records: newRecords
  });
}

// [POST] /admin/articles-category/create
module.exports.createPost = async (req, res) => {
  const permissions = res.locals.role.permissions;

  if (permissions.includes("articles-category_create")) {
    if (req.body.position == NaN || req.body.position == '') {
      const count = await ArticleCategory.countDocuments();
      req.body.position = count + 1;
    } else {
      req.body.position = parseInt(req.body.position);
    }

    const record = new ArticleCategory(req.body);
    await record.save();

    res.redirect(`${SystemConfig.preFixAdmin}/articles-category`);
  } else {
    res.send("403");
    return;
  }
};

// [GET] /admin/articles-category/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const findone = {
      deleted: false,
      _id: req.params.id
    }

    const data = await ArticleCategory.findOne(findone);

    find = {
      $or: [{
        deleted: false
      }, {
        deletedAt: {
          $ne: null
        }
      }]
    };

    const records = await ArticleCategory.find(find);

    const newRecords = createTreeHelper.tree(records);

    res.render("admin/pages/articles-category/edit", {
      pageTitle: "Chỉnh sửa danh mục bài viết",
      data: data,
      records: newRecords
    });
  } catch (error) {
    res.redirect(`${SystemConfig.preFixAdmin}/articles-category`);
  }

}

// [PATCH] /admin/articles-category/edit/:id
module.exports.editPatch = async (req, res) => {
  const permissions = res.locals.role.permissions;

  if (permissions.includes("articles-category_edit")) {
    const id = req.params.id;

    req.body.position = parseInt(req.body.position);

    try {
      const updatedBy = {
        account_id: res.locals.user.id,
        updatedAt: Date.now()
      };

      await ArticleCategory.updateOne({
        _id: id
      }, {
        ...req.body,
        $push: { updatedBy: updatedBy }
      });
      req.flash('success', 'Cập nhật danh mục thành công!');
    } catch (error) {
      req.flash('error', 'Cập nhật danh mục thất bại!');
    }

    res.redirect("back");
  } else {
    res.send("403");
    return;
  }
};

// [GET] /admin/articles-category/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const findone = {
      deleted: false,
      _id: req.params.id
    }

    const data = await ArticleCategory.findOne(findone);

    find = {
      $or: [{
        deleted: false
      }, {
        deletedAt: {
          $ne: null
        }
      }]
    };

    const records = await ArticleCategory.find(find);

    const newRecords = createTreeHelper.tree(records);;

    res.render("admin/pages/articles-category/detail", {
      pageTitle: data.title,
      data: data,
      records: newRecords
    });
  } catch (error) {
    res.redirect(`${SystemConfig.preFixAdmin}/articles-category`);
  }

}