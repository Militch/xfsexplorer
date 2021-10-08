var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('blocks', { title: 'Blocks - XFS Explorer',req: req  });
});

router.get(/^\/(.+)/, function(req, res, next) {
  res.render('blockdetail', { title: 'Block Detail - XFS Explorer', req: req  });
});

module.exports = router;
