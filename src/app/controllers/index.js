var express = require('express');
var router = express.Router();
var oauth2 = require('../lib/oauth2');

// Use the oauth middleware to automatically get the user's profile
// information and expose login/logout URLs to templates. The data from the template can be used in the view


router.get('/', function (req, res, next) {
    req.url = "/game";
    next();
});


module.exports = router;

