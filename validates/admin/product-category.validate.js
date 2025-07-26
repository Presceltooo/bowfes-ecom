module.exports.createPost = (req, res, next) => {
  if (!req.body.title) {
    req.flash('error', 'Vui lòng nhập tên danh mục sản phẩm!');
    res.redirect('back');
    return;
  }

  next();
}