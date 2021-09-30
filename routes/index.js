var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.path);
  console.log(req.route);
  console.log(req.baseUrl);
  res.render('index', { title: 'Home - XFS Explorer',req: req  });
});

module.exports = router;
