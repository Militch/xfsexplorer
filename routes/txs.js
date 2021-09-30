var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('txs', { title: 'Txs - XFS Explorer' });
});

module.exports = router;
