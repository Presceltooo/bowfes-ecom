const md5 = require ('md5');
const Account = require("../../models/account.model")
const Role = require("../../models/role.model")
const SystemConfig = require("../../config/system.js");


// [GET] /admin/accounts
module.exports.index = async (req, res) => {
  let find = {
    $or: [{
      deleted: false
    }, {
      deletedAt: {
        $ne: null
      }
    }]
  };

  const records = await Account.find(find).select("-password -token");

  for (const record  of records) {
    const role = await Role.findOne({
      $and: [{
        _id: record.role_id
      },
      {$or: [{
        deleted: false
      }, {
        deletedAt: {
          $ne: null
        }
      }]}]
    });

    record.role = role;
  }

  res.render("admin/pages/accounts/index", {
    pageTitle: "Danh sách tài khoản",
    records: records,
  });
}

// [GET] /admin/accounts/create
module.exports.create = async (req, res) => {
  const roles = await Role.find({ deleted: false });

  res.render("admin/pages/accounts/create", {
    pageTitle: "Tạo tài khoản",
    roles: roles
  });
}

// [POST] /admin/accounts/createPost
module.exports.createPost = async (req, res) => {
  const emailExist = await Account.findOne({
    email: req.body.email,
    deleted: false
  });

  if (emailExist) {
    req.flash("error", `Email ${req.body.email} đã tồn tại`);
    res.redirect("back");
  } else {
    req.body.password = md5(req.body.password);

    const record = new Account(req.body);
    await record.save();

    res.redirect(`${SystemConfig.preFixAdmin}/accounts`);
  }
}

// [GET] /admin/accounts/edit/:id
module.exports.edit = async (req, res) => {
  let find = {
    $and: [{
      _id: req.params.id
    },
    {
      $or: [{
        deleted: false
      }, {
        deletedAt: {
          $ne: null
        }
      }]
    }
    ]
    };
  
  try {
    const data = await Account.findOne(find);

    const roles = await Role.find({ deleted: false });

  res.render("admin/pages/accounts/edit", {
    pageTitle: "Chỉnh sửa tài khoản",
    data: data,
    roles: roles
  });
  } catch (error) {
    res.redirect(`${SystemConfig.preFixAdmin}/accounts`);
  }
}

// [PATCH] /admin/accounts/edit/:id
module.exports.editPatch = async (req, res) => {
  const id = req.params.id;

  const emailExist = await Account.findOne({
    _id: { $ne: id },
    email: req.body.email,
    deleted: false
  });

  if (emailExist) {
    req.flash("error", `Email ${req.body.email} đã tồn tại`);
  } else {
    if (req.body.password) {
      req.body.password = md5(req.body.password);
    } else {
      delete req.body.password;
    }

    await Account.updateOne({
      _id: id
    }, req.body);

    req.flash("success", "Cập nhật tài khoản thành công!");
  }

  res.redirect("back");
}