// phát sinh vấn đề nếu dùng app nhiều thì sẽ liên tục cần truyển tham số ở từ trang ở vào
// thay vào đó ta sẽ sử dụng router để giải quyết vấn đề này của express

const express = require('express');
const router = express.Router();

const controller = require("../../controllers/client/product.controller");

// "/" vì trang products giờ sẽ là trang chủ của các trang nhỏ hơn trong products
router.get('/', controller.index);

router.get('/:slug', controller.detail);

module.exports = router;