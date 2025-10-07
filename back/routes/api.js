var express = require('express');
var router = express.Router();

var users = require('../api/controllers/userController')
let auth = require('../api/controllers/authController')

let authMiddle = require('../api/middleware/authMiddleware.js')

router.get('/users', authMiddle.checkForAuth, users.getUsers);
router.post('/users/new', users.registerUser);
router.post('/users/delete', authMiddle.checkForAuth, users.deleteUser);
router.post('/users/block', authMiddle.checkForAuth, users.toggleblockUser);

router.post('/login', auth.login);
router.get('/validate', auth.validateToken)

module.exports = router;
