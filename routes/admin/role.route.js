const express = require('express');
const router = express.Router();

const controller = require("../../controllers/admin/role.controller");

router.get('/', controller.index);

router.delete('/delete/:id', controller.deleteItem);

router.patch('/restore/:id', controller.restoreItem);

router.get('/create', controller.create);

router.post('/create', controller.createPost);

router.get('/edit/:id', controller.edit);

router.patch('/edit/:id', controller.editPatch);

router.get('/detail/:id', controller.detail);

module.exports = router;