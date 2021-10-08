var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('txs', { title: 'Txs - XFS Explorer',req: req });
});

module.exports = router;
