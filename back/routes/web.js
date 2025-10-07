var express = require('express');
var router = express.Router();
var users = require('../api/controllers/userController')

/* GET home page. */
router.get('/verify', async function(req, res, next) {
    let validationSuccess = await users.verifyUser(req, res, next)
    let title = validationSuccess ? 'Verification successful! You can now close this window.' : 'Wrong verification token!'
    res.render(
        'verification', { title: title });
});

module.exports = router;
