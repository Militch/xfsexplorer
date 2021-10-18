var express = require('express');
var router = express.Router();
var {
  calcBlockReward,
  coinFormat,
  baseIntFormat,
  calcDifficulty,
} = require('../util/util.js');

/* GET home page. */
router.get('/', async function(req, res, next) {
  const { service } = req;
  var latestHead = await service.fetchChainHead();
  var currentDifficulty = 1;
  if (latestHead.height !== 0) {
    var genesisBlk = await service.fetchGenesisBlk();
    currentDifficulty = calcDifficulty(genesisBlk.bits, latestHead.bits).toNumber();
  }
  let blks = await service.fetchBlocks(latestHead.height, 10);
  let txs = await service.fetchLatestTransactions(latestHead.height, 10);
  var modelmap = {
    latestHeight: baseIntFormat(latestHead.height),
    blockReward: coinFormat(calcBlockReward(latestHead.height)),
    currentDifficulty: currentDifficulty,
    latestBlocks: blks,
    latestTxs: txs,
  }
  res.render('index', { title: 'Home - XFS Explorer',req: req, data: modelmap});
});

module.exports = router;
