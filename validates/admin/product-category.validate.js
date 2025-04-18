module.exports.createPost = (req, res, next) => {
  if (!req.body.title) {
    req.flash('error', 'Vui lòng nhập tên sản phẩm!');
    res.redirect('back');
    return;
  }

  if (req.body.title.length <= 8) {
    console.log(req.body.title.length);
    req.flash('error', 'Vui lòng nhập tên sản phẩm ít nhất 8 ký tự!');
    res.redirect('back');
    return;
  }

  next();
}