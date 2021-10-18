var express = require('express');
var router = express.Router();


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
  let blks = await service.fetchBlocks(
    (lastHeight - (pagenum * pagesize)), 
    pagesize);
  let modelmap = {
    list: blks,
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
  res.render('blocks', {
    title: 'Blocks - XFS Explorer',
    req: req,
    data: modelmap
  });
});

router.get(/^\/(.+)/, async function (req, res, next) {
  const {service} = req;
  let reqHash = req.params[0];
  let blk = await service.fetchBlockByHash(reqHash);
  if (!blk) {
    res.status(404).render('error');
    return;
  }
  let modelmap = {
    blk: blk,
  };
  res.render('blockdetail', {
    title: 'Block Detail - XFS Explorer',
    req: req,
    data: modelmap
  });
});

module.exports = router;