var express = require('express');
var router = express.Router();
var HttpJsonRpcClient = require('../jsonrpc/client.js');

var cli = new HttpJsonRpcClient({
  url: 'http://127.0.0.1:9001'
});

function isEmptyStr(s) {
  if (s == undefined || s == null || s == '') {
    return true
  }
  return false
}

router.get('/', async function (req, res, next) {
  const {service} = req;
  const pagesize = 20;
  let params = req.query;
  let pagenum = 0;
  if (!isEmptyStr(params.p)) {
    if (!isNaN(params.p)) {
      pagenum = parseInt(params.p);
    }
  }
  let latestHead = await service.fetchChainHead();
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
  
  let data = await service.fetchHeightBlocks(
    (lastHeight - (pagenum * pagesize)), pagesize);
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

module.exports = router;