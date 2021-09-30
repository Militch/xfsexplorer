var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('blocks', { title: 'Blocks - XFS Explorer' });
});

module.exports = router;
