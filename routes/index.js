var express = require('express');
var router = express.Router();



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'IADMDB' });
});


router.get('/formulaire', function(req, res, next) {
  res.render('form', { title: 'IADMDB' });
});

module.exports = router;
