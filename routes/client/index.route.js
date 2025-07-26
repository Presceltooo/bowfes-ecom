const categoryMiddleware = require("../../middlewares/client/category.middleware");

const productRoutes = require("./product.route");
const homeRoutes = require("./home.route");

module.exports = (app) => {
  app.use(categoryMiddleware.category);
  // Middleware luôn sẵn để lấy dữ liệu category

  app.use('/', homeRoutes);

  app.use('/products', productRoutes);
  // use vì có get ở trong product.route.js, và productRoutes là đang dùng thẳng hàm => tiện
}