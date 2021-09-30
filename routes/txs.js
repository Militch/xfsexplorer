var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  console.log(req.path);
  console.log(req.route);
  console.log(req.baseUrl);
  res.render('txs', { title: 'Txs - XFS Explorer',req: req });
});

module.exports = router;
