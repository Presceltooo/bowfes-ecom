const User = require("../../models/user.model");

module.exports.requireAuth = async (req, res, next) =>  {

  if (!req.cookies.tokensUser) {
    res.redirect(`/user/login`);
    return;
  } else {
    const user = await User.findOne({ 
      tokenUser: req.cookies.tokenUser, 
      deleted: false 
    }).select("-password");

    if (!user) {
      res.redirect(`/user/login`);
      return;
    } else {
      next();
    }
  }
}

 