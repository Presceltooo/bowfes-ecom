const Role = require("../../models/role.model")
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

  res.render("admin/pages/roles/index", {
    pageTitle: "Nhóm quyền",
    records: records,
  });
}

// [DELETE] /admin/roles/delete/:id
module.exports.deleteItem = async (req, res) => {
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
}

// [PATCH] /admin/roles/restore/:id
module.exports.restoreItem = async (req, res) => {
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
}

// [GET] /admin/roles/create
module.exports.create = async (req, res) => {
  res.render("admin/pages/roles/create", {
    pageTitle: "Tạo nhóm quyền",
  });
}

// [POST] /admin/roles/create
module.exports.createPost = async (req, res) => {
  const record = new Role(req.body);

  await record.save();

  res.redirect(`${SystemConfig.preFixAdmin}/roles`);
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
  const id = req.params.id;

  try {
    await Role.updateOne({
      _id: id
    }, req.body);
    req.flash('success', 'Cập nhật phân quyền thành công!');
  } catch (error) {
    req.flash('error', 'Cập nhật phân quyền thất bại!');
  }

  res.redirect("back");
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