var express = require('express');
var router = express.Router();
var HttpJsonRpcClient = require('../jsonrpc/client.js');

var cli = new HttpJsonRpcClient({
  url: 'http://127.0.0.1:9001'
});



function timeformat(current = Date, last) {
  let now = parseInt(current.getTime() / 1000)
  let diff = now - last;
  let timestr = `${diff} secs ago`;
  if (diff >= 60 && diff < 60 * 60) {
    var mins = parseInt(diff / 60);
    timestr = `${mins} mins ago`;
  } else if (diff >= 60 * 60 && diff < 60 * 60 * 24) {
    var hr = parseInt(diff / (60 * 60));
    var mins = parseInt((diff / 60) % 60);
    timestr = `${hr} hr ${mins} min ago`;
  } else if (diff >= 60 * 60 * 24) {
    timestr = current.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
  }
  return timestr;
}







async function fetchHeightBlocks(from, count) {
  if (from < 0) {
    from = 0
  }
  if (count < 0) {
    return null;
  }
  const arr = [];
  for (let i = from, j=0; i > from - count && j < from+1; i--, j++) {
    var blks = await cli.call({
      method: 'Chain.GetBlocksByNumber',
      params: {
        number: `${i}`
      }
    });
    arr.push({
      height: i,
      blocks: blks
    });
  }
  return arr;
}

function coverHeightBlocks(hblocks = []) {
  covers = [];
  for (let i = 0; i < hblocks.length; i++) {
    let hblock = hblocks[i];
    hblock.blockscount = 0;
    if (hblock.blocks && hblock.blocks.length > 0){
      hblock.blockscount = hblock.blocks.length;
    }
    let hashes = [];
    for (let j=0;j<hblock.blockscount;j++){
        hashes.push(hblock.blocks[j].hash);
    }
    hblock.hashes = hashes;
    covers.push(hblock);
  }
  return covers;
}

async function fetchBlockByHash(hash) {
  if (!hash || hash.length === 0) {
    return null;
  }
  return cli.call({
    method: 'Chain.GetBlockByHash',
    params: {
      hash: `${hash}`
    }
  });
}


function isEmptyStr(s) {
  if (s == undefined || s == null || s == '') {
    return true
  }
  return false
}

router.get('/', async function (req, res, next) {
  const pagesize = 20;
  let params = req.query;
  let pagenum = 0;
  if (!isEmptyStr(params.p)) {
    if (!isNaN(params.p)) {
      pagenum = parseInt(params.p);
    }
  }
  let latestHead = await cli.call({
    method: 'Chain.Head'
  });
  let lastHeight = latestHead.height;
  let totalPage = Math.floor(lastHeight / pagesize);
  let rem = Math.floor(lastHeight % pagesize);
  if (rem > 20) {
    totalPage += 1;
  }
  let pagefrom = pagenum * pagesize;
  let prevpage = pagenum - 1;
  if (prevpage < 0) {
    prevpage = 0;
  }
  let nextpage = pagenum + 1;
  if (nextpage > totalPage) {
    nextpage = totalPage;
  }
  let pageto = pagefrom + pagesize;
  if (pageto > lastHeight) {
    pageto = lastHeight;
  }
  
  let data = await fetchHeightBlocks((lastHeight - (pagenum * pagesize)), pagesize);
  data = coverHeightBlocks(data);
  let modelmap = {
    list: data,
    page: {
      from: pagefrom,
      to: pageto,
      total: lastHeight,
      totalpage: totalPage,
      pagenum: pagenum,
      nextpage: nextpage,
      prevpage: prevpage,
    }
  };
  res.render('blocksdebug', {
    title: 'Blocks (debug) - XFS Explorer',
    req: req,
    data: modelmap
  });
});

function coverBlock(blk) {
  console.log(blk);
  let blkt = parseInt(blk.timestamp);
  let blktime = new Date(blkt * 1000);
  let timestr = blktime.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  });
  blk.timestr = timestr;
  blk.txcount = 0;
  let txs = blk.transactions;
  if (txs != null) {
    blk.txcount = txs.length;
    for (let i = 0; i < txs.length; i++) {
      let tx = txs[i];
      console.log(tx);
    }
  }

  return blk;
}
router.get(/^\/(.+)/, async function (req, res, next) {
  let reqHash = req.params[0];
  let blk = await fetchBlockByHash(reqHash);
  if (!blk) {
    res.status(404).render('error');
    return;
  }
  let blkc = coverBlock(blk);
  let modelmap = {
    blk: blkc,
  };
  res.render('blockdetail', {
    title: 'Block Detail - XFS Explorer',
    req: req,
    data: modelmap
  });
});

module.exports = router;