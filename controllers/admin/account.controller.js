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

// [PATCH] /admin/accounts/change-status/:change-status/:id
module.exports.changeStatus = async (req, res) => {
  const permissions = res.locals.role.permissions;

  if (permissions.includes("accounts_edit")) {
    const status = req.params.status;
    const id = req.params.id;
    
    await Account.updateOne({
      _id: id
    }, {
      status: status
    });
    req.flash('success', 'Cập nhật trạng thái tài khoản thành công!');

    res.redirect('back');
  } else {
    res.send("403");
    return;
  }
}


// [DELETE] /admin/accounts/delete/:id
module.exports.deleteItem = async (req, res) => {
  const permissions = res.locals.role.permissions;

  if (permissions.includes("accounts_delete")) {
    const id = req.params.id;

    // await Role.deleteOne({_id: id});
    await Account.updateOne({
      _id: id
    }, {
      deleted: true,
      deletedAt: Date.now()
    });
    req.flash('success', `Xóa thành công tài khoản!`);

    res.redirect('back');
  } else {
    res.send("403");
    return;
  }
}

// [PATCH] /admin/accounts/restore/:id
module.exports.restoreItem = async (req, res) => {
  const permissions = res.locals.role.permissions;

  if (permissions.includes("accounts_delete")) {
    const id = req.params.id;

    // await Product.deleteOne({_id: id});
    await Account.updateOne({
      _id: id
    }, {
      deleted: false,
      deletedAt: null
    });
    req.flash('success', `Khôi phục thành công tài khoản!`);

    res.redirect('back');
  } else {
    res.send("403");
    return;
  }
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
  const permissions = res.locals.role.permissions;

  if (permissions.includes("accounts_create")) {
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
  } else {
    res.send("403");
    return;
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
  const permissions = res.locals.role.permissions;

  if (permissions.includes("accounts_edit")) {
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
  } else {
    res.send("403");
    return;
  }
}

// [GET] /admin/accounts/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const findone = {
      deleted: false,
      _id: req.params.id
    }

    const data = await Account.findOne(findone).select("-password -token");

    const role = await Role.findOne({
      $and: [{
          _id: data.role_id
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
    });

    data.role = role;

    res.render("admin/pages/accounts/detail", {
      pageTitle: data.fullName,
      data: data
    });
  } catch (error) {
    res.redirect(`${SystemConfig.preFixAdmin}/accounts`);
  }

}