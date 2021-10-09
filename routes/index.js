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


async function fetchBlocks(from, count) {
  if (from < 0) {
    from = 0
  }
  if (count < 0){
    return null;
  }
  const arr = [];
  for (let i=from; i > from - count; i--) {
    var blk = await cli.call({method:'Chain.GetBlockByNumber', params: {
      number: `${i}`
    }});
    if (blk === null) {
      break;
    }
    arr.push(blk);
  }
  return arr;
}

async function fetchLatestTransactions(latestHeight, count) {
  if (latestHeight < 0 || count < 0) {
    return null;
  }
  const arr = [];
  for (let i=latestHeight, j=0; i >= 0 && (latestHeight - i) < 10;  i--) {
    var blk = await cli.call({method:'Chain.GetBlockByNumber', params: {
      number: `${i}`
    }});
    if (blk === null) {
      break;
    }
    if (blk.transactions === null) {
      continue;
    }
    arr.concat(blk.transactions);
    j += blk.transactions.length;
    if (j > count) {
      break;
    }
  }
  return arr;
}



function timeformat(current=Date, last) {
  let now = parseInt(current.getTime() / 1000)
  let diff = now - last;
  let timestr = `${diff} secs ago`;
  if (diff >= 60 && diff < 60*60) {
    var mins = parseInt(diff / 60);
    timestr = `${mins} mins ago`;
  }else if(diff >= 60*60 && diff < 60*60*24) {
    var hr = parseInt(diff / (60 * 60));
    var mins = parseInt((diff / 60) % 60);
    timestr = `${hr} hr ${mins} min ago`;
  }else if (diff >= 60*60*24){
    timestr = current.toUTCString();
  }
  return timestr;
}

function coverBlocks(blocks=[]) {
  covers = [];
  let now = new Date();
  for (let i=0;i<blocks.length;i++) {
    let blk = blocks[i];
    let timestr = timeformat(now, blk.timestamp);
    blk.timestr = timestr;
    blk.txcount = 0;
    if (blk.transactions != null) {
      blk.txcount = blk.txcount.length;
    }
    covers.push(blk);
  }
  return covers;
}


/* GET home page. */
router.get('/', async function(req, res, next) {
  var latestHead = await cli.call({method:'Chain.Head'});
  var currentDifficulty = 1;
  if (latestHead.height !== 0) {
    var genesisBlk = await cli.call({method:'Chain.GetBlockByNumber', params: {
      number: "0"
    }});
    console.log(`genesisBlk:`, genesisBlk);
    currentDifficulty = calcDifficulty(genesisBlk.bits, latestHead.bits).toNumber();
  }
  let blks = await fetchBlocks(latestHead.height, 10);
  console.log('--');
  let txs = await fetchLatestTransactions(latestHead.height, 10);
  console.log('--');
  console.log('txs-', txs.length);
  console.log('txs', txs);
  blks = coverBlocks(blks);
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
