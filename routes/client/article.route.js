const express = require('express');
const router = express.Router();

const controller = require("../../controllers/client/article.controller");

router.get('/', controller.index);

router.get('/:slugCategory', controller.category);

router.get('/detail/:slugArticle', controller.detail);

module.exports = router;