const systemConfig = require("../../config/system");

const authMiddleware = require("../../middlewares/admin/auth.middleware");

const dashboardRoutes = require("./dashboard.route");
const productRoutes = require("./product.route");
const productCategoryRoutes = require("./product-category.route");
const roleRoutes = require("./role.route");
const accountRoutes = require("./account.route")
const authRoutes = require("./auth.route")
const articleCategoryRoutes = require("./article-category.route")
const myAccountRoutes = require("./my-account.route")
const articleRoutes = require("./article.route");
const orderRoutes = require("./order.route");
const settingRoutes = require("./setting.route");


module.exports = (app) => {
  const PATCH_ADMIN = systemConfig.preFixAdmin;

  app.use(PATCH_ADMIN + '/dashboard', authMiddleware.requireAuth, dashboardRoutes);

  app.use(PATCH_ADMIN + '/products', authMiddleware.requireAuth, productRoutes);

  app.use(PATCH_ADMIN + '/products-category', authMiddleware.requireAuth, productCategoryRoutes);

  app.use(PATCH_ADMIN + '/roles', authMiddleware.requireAuth, roleRoutes);

  app.use(PATCH_ADMIN + '/accounts', authMiddleware.requireAuth, accountRoutes);

  app.use(PATCH_ADMIN + '/auth', authRoutes);

  app.use(PATCH_ADMIN + '/articles-category', authMiddleware.requireAuth, articleCategoryRoutes);

  app.use(PATCH_ADMIN + '/my-account', authMiddleware.requireAuth, myAccountRoutes);

  app.use(PATCH_ADMIN + '/articles', authMiddleware.requireAuth, articleRoutes);

  app.use(PATCH_ADMIN + '/orders', authMiddleware.requireAuth, orderRoutes);

  app.use(PATCH_ADMIN + '/settings', authMiddleware.requireAuth, settingRoutes);
}