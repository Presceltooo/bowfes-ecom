const md5 = require('md5');

const User = require("../../models/user.model");
const ForgotPassword = require("../../models/forgot-password.model");
const Cart = require("../../models/cart.model");

const generateHelper = require("../../helpers/generate");
const sendMailHelper = require("../../helpers/sendMail");


// [GET] /user/register
module.exports.register = async (req, res) => {
 
  res.render("client/pages/user/register", {
    pageTitle: "Đăng ký tài khoản"
  });
}

// [POST] /user/register
module.exports.registerPost = async (req, res) => {
  const existEmail = await User.findOne({
    email: req.body.email,
    deleted: false
  })

  if (existEmail) {
    req.flash("error", `Email ${req.body.email} đã được sử dụng!`);
    res.redirect("back");
    return;
  }

  req.body.password = md5(req.body.password);

  const user = new User(req.body);
  await user.save();

  res.cookie("tokenUser", user.tokenUser)

  res.redirect("/");
}

// [GET] /user/login
module.exports.login = async (req, res) => {

  res.render("client/pages/user/login", {
    pageTitle: "Đăng nhập tài khoản"
  });
}

// [POST] /user/loginPost
module.exports.loginPost = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.findOne({
    email: email,
    deleted: false
  });

  if (!user) {
    req.flash("error", "Email này không tồn tại!");
    res.redirect("back");
    return;
  }

  if (md5(password) != user.password) {
    req.flash("error", "Mật khẩu không chính xác!");
    res.redirect("back");
    return;
  }

  if (user.status == "inactive") {
    req.flash("error", "Tài khoản đã bị khóa!");
    res.redirect("back");
    return;
  }

  res.cookie("tokenUser", user.tokenUser);

  // Lưu user_id vào collection carts
  await Cart.updateOne({
    _id: req.cookies.cartId
  }, {
    user_id: user.id
  });

  res.redirect("/");
}

// [GET] /user/logout
module.exports.logout = async (req, res) => {
  res.clearCookie("tokenUser");
  res.redirect("/");
};

// [GET] /user/password/forgot
module.exports.forgotPassword = async (req, res) => {

  res.render("client/pages/user/forgot-password", {
    pageTitle: "Quên mật khẩu"
  });
}

// [POST] /user/password/forgot
module.exports.forgotPasswordPost = async (req, res) => {
  const email = req.body.email;

  const user = await User.findOne({
    email: email,
    deleted: false
  });

  if (!user) {
    req.flash("error", "Email này không tồn tại!");
    res.redirect("back");
    return;
  }
  
  // Việc 1: Tạo mã OTP và lưu OTP, email vào colletion
  const otp = generateHelper.generateRandomNumber(6);

  const objectForgotPassword = {
    email: email,
    otp: otp,
    expireAt: Date.now()
  };

  objectForgotPassword.otp = otp;

  console.log(otp);

  const forgotPassword = new ForgotPassword(objectForgotPassword);
  await forgotPassword.save();


  // Việc 2: Gửi mã OTP qua email cho user
  const subject = "Mã OTP đặt lại mật khẩu";
  const html = `
  <p>Mã OTP của bạn là: <strong>${otp}</strong>. Thời hạn sử dụng mã OTP là 3 phút. Lưu ý không chia sẻ mã này với bất kỳ ai.</p>
  `;

  sendMailHelper.sendMail(email, subject, html);

  res.redirect(`/user/password/otp?email=${email}`);
};

// [GET] /user/password/otp
module.exports.otpPassword = async (req, res) => {
  const email = req.query.email;

  res.render("client/pages/user/otp-password", {
    pageTitle: "Xác thực OTP",
    email: email
  });
}

// [POST] /user/password/otp
module.exports.otpPasswordPost = async (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp;

  const result = await ForgotPassword.findOne({
    email: email,
    otp: otp
  });

  if (!result) {
    req.flash("error", "Mã OTP không hợp lệ hoặc đã hết hạn!");
    res.redirect("back");
    return;
  }

  const user = await User.findOne({
    email: email,
  });

  res.cookie("tokenUserOTP", user.tokenUser);
  // Tránh bug Login

  res.redirect("/user/password/reset");
}

// [GET] /user/password/reset
module.exports.resetPassword = async (req, res) => {
  const email = req.query.email;

  res.render("client/pages/user/reset-password", {
    pageTitle: "Đặt lại mật khẩu",
    email: email
  });
}

// [GET] /user/password/reset
module.exports.resetPasswordPost = async (req, res) => {
  const password = md5(req.body.password);
  const tokenUserOTP = req.cookies.tokenUserOTP;

  const user = await User.findOne({
    tokenUser: tokenUserOTP
  });

  if (password != user.password) {
    await User.updateOne({
      tokenUser: tokenUserOTP
    }, {
      password: password
    });

    req.flash("success", "Đặt lại mật khẩu thành công!");
    res.cookie("tokenUser", tokenUserOTP);
    res.redirect("/");
  } else {
    // Nếu mật khẩu mới trùng với mật khẩu cũ
    req.flash("error", "Mật khẩu mới không được trùng với mật khẩu cũ!");
    res.redirect("back");
  }
}

// [GET] /user/info
module.exports.info = async (req, res) => {
  const user = await User.findOne({
    tokenUser: req.cookies.tokenUser
  });

  if (!user) {
    req.flash("error", "Bạn cần đăng nhập để truy cập trang này!");
    res.redirect("/user/login");
    return;
  }

  res.render("client/pages/user/info", {
    pageTitle: "Thông tin tài khoản",
    user: user
  });
}