var express = require('express');
var router = express.Router();
var pug = require('pug');
/* GET pub_chat page. */
router.get('/', function(req, res, next) {
    if(!req.session.user) {
        res.redirect('/');
    }else {
        res.render('homepage',{user:req.session.user});

    }
});

module.exports = router;