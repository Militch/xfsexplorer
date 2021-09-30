var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  console.log(req.path);
  console.log(req.route);
  console.log(req.baseUrl);
  res.render('blocks', { title: 'Blocks - XFS Explorer',req: req  });
});

router.get(/^\/(.+)/, function(req, res, next) {
  console.log(req.path);
  console.log(req.route);
  console.log(req.baseUrl);
  res.render('blockdetail', { title: 'Block Detail - XFS Explorer', req: req  });
});

module.exports = router;
