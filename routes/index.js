var express = require('express');
var router = express.Router();
var {
  calcBlockReward,
  coinFormat,
  baseIntFormat,
  calcDifficulty,
} = require('../util/util.js');
var HttpJsonRpcClient = require('../jsonrpc/client.js');

var cli = new HttpJsonRpcClient({url:'http://127.0.0.1:9001'});



/* GET home page. */
router.get('/', async function(req, res, next) {
  var latestHead = await cli.call({method:'Chain.Head'});
  var currentDifficulty = 1;
  if (latestHead.height !== 0) {
    currentDifficulty = calcDifficulty(4278190109, latestHead.bits).toNumber();
  }
  console.log('diff:', currentDifficulty);
  var modelmap = {
    latestHeight: baseIntFormat(latestHead.height),
    blockReward: coinFormat(calcBlockReward(latestHead.height)),
    currentDifficulty: currentDifficulty
  }
  res.render('index', { title: 'Home - XFS Explorer',req: req, data: modelmap});
});

module.exports = router;
