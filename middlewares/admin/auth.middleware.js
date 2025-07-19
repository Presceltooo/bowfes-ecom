const SystemConfig = require("../../config/system.js");
const Account = require("../../models/account.model")

module.exports.requireAuth = async (req, res, next) =>  {
  if (!req.cookies.token) {
    res.redirect(`${SystemConfig.preFixAdmin}/auth/login`);
  } else {
    const user = await Account.findOne({ token: req.cookies.token, deleted: false });
    if (!user) {
      res.redirect(`${SystemConfig.preFixAdmin}/auth/login`);
    } else {
      next();
    }
  }
}

 