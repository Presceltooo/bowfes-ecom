// đây như là trang quản lý chung

const productRoutes = require("./product.route");
const homeRoutes = require("./home.route");

module.exports = (app) => {
  app.use('/', homeRoutes);
  
  app.use('/products', productRoutes);
  // use vì có get ở trong product.route.js, và productRoutes là đang dùng thẳng hàm => tiện
}