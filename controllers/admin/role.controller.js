const Role = require("../../models/role.model")
const Account = require("../../models/account.model");
const SystemConfig = require("../../config/system.js");


// [GET] /admin/roles
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

  const records = await Role.find(find);


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
  

  res.render("admin/pages/roles/index", {
    pageTitle: "Nhóm quyền",
    records: records,
  });
}

// [DELETE] /admin/roles/delete/:id
module.exports.deleteItem = async (req, res) => {
  const permissions = res.locals.role.permissions;

  if (permissions.includes("roles_delete")) {
    const id = req.params.id;

    // await Role.deleteOne({_id: id});
    await Role.updateOne({
      _id: id
    }, {
      deleted: true,
      deletedAt: Date.now()
    });
    req.flash('success', `Xóa thành công nhóm quyền!`);

    res.redirect('back');
  } else {
    res.send("403");
    return;
  }
}

// [PATCH] /admin/roles/restore/:id
module.exports.restoreItem = async (req, res) => {
  const permissions = res.locals.role.permissions;

  if (permissions.includes("roles_delete")) {
    const id = req.params.id;

    // await Product.deleteOne({_id: id});
    await Role.updateOne({
      _id: id
    }, {
      deleted: false,
      deletedAt: null
    });
    req.flash('success', `Khôi phục thành công nhóm quyền!`);

    res.redirect('back');
  } else {
    res.send("403");
    return;
  }
}

// [GET] /admin/roles/create
module.exports.create = async (req, res) => {
  res.render("admin/pages/roles/create", {
    pageTitle: "Tạo nhóm quyền",
  });
}

// [POST] /admin/roles/create
module.exports.createPost = async (req, res) => {
  const permissions = res.locals.role.permissions;

  if (permissions.includes("roles_create")) {
    const record = new Role(req.body);

    await record.save();

    res.redirect(`${SystemConfig.preFixAdmin}/roles`);
  } else {
    res.send("403");
    return;
  }
}

// [GET] /admin/roles/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const find = {
      _id: req.params.id,
      deleted: false
    }

    const data = await Role.findOne(find);

    res.render("admin/pages/roles/edit", {
      pageTitle: "Sửa nhóm quyền",
      data: data
    });
  } catch (error) {
    res.redirect(`${SystemConfig.preFixAdmin}/roles`);
  }
}

// [PATCH] /admin/roles/edit/:id
module.exports.editPatch = async (req, res) => {
  const permissions = res.locals.role.permissions;

  if (permissions.includes("roles_edit")) {
    const id = req.params.id;

    try {
      const updatedBy = {
        account_id: res.locals.user.id,
        updatedAt: Date.now()
      };

      await Role.updateOne({
        _id: id
      }, {
        ...req.body,
      $push: { updatedBy: updatedBy }
      });
      req.flash('success', 'Cập nhật phân quyền thành công!');
    } catch (error) {
      req.flash('error', 'Cập nhật phân quyền thất bại!');
    }

    res.redirect("back");
  } else {
    res.send("403");
    return;
  }
}

// [GET] /admin/roles/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id
    }

    const data = await Role.findOne(find);

    res.render("admin/pages/roles/detail", {
      pageTitle:  data.title,
      data: data,
    });
  } catch (error) {
    res.redirect(`${SystemConfig.preFixAdmin}/roles`);
  }

}

// [GET] /admin/roles/permissions
module.exports.permissions = async (req, res) => {
  let find = {
    deleted: false
  };

  const records = await Role.find(find);

  res.render("admin/pages/roles/permissions", {
    pageTitle: "Phân quyền",
    records: records,
  });
}

// [PATCH] /admin/roles/permissions
module.exports.permissionsPatch = async (req, res) => {
  const subPermissions = res.locals.role.permissions;

  if (subPermissions.includes("roles_permissions")) {
    const permissions = JSON.parse(req.body.permissions);

    try {
      for (const item of permissions) {
        await Role.updateOne({
          _id: item.id
        }, {
          permissions: item.permissions
        });
      }
      req.flash('success', "Cập nhật phân quyền thành công!");
    } catch (error) {
      req.flash('error', "Cập nhật phân quyền thất bại!");
    }

    res.redirect("back");
  } else {
    res.send("403");
    return;
  }
}