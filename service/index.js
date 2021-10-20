var HttpJsonRpcClient = require('../jsonrpc/client');

function coverBlock(blk) {
    let blkt = parseInt(blk.timestamp);
    let blktime = new Date(blkt * 1000);
    let timestr = blktime.toLocaleString('en-US', {
      weekday: 'short',
      month:'short',
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
      for (let i=0;i<txs.length;i++){
        let tx =  txs[i];
        console.log(tx);
      }
    }
    return blk;
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
        blk.txcount = blk.transactions.length;
      }
      covers.push(blk);
    }
    return covers;
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
class Service {
    constructor({rpcapi}){
        console.log(`RPC API Host: ${rpcapi}`);
        this.rpccli = new HttpJsonRpcClient({
            url: rpcapi,
        });
    }
    async fetchBlocks(from, count) {
        if (from < 0) {
          from = 0
        }
        if (count < 0){
          return null;
        }
        var firstblk = await this.fetchBlockByNumber(from);
        const arr = [];
        let oldblk = firstblk;
        arr.push(oldblk);
        for (let i = from-1, j=0; i > from - count && j < from; i--, j++) {
          oldblk = await this.fetchBlockByHash(oldblk.hash_prev_block);
          if (oldblk === null) {
            break;
          }
          arr.push(oldblk);
        }
        return coverBlocks(arr);
    }
    async fetchBlocksLast(from, count) {
      if (from < 0) {
        from = 0
      }
      if (count < 0){
        return null;
      }
      const arr = [];
      for (let i = from, j=0; i > from - count && j < from+1; i--, j++) {
        var blk = await this.rpccli.call({method:'Chain.GetBlockByNumber', params: {
          number: `${i}`
        }});
        if (blk === null) {
          break;
        }
        arr.push(blk);
      }
      return coverBlocks(arr);
  }
    fetchGenesisBlk(){
        return this.rpccli.call({method:'Chain.GetBlockByNumber', params: {
            number: "0"
        }});
    }
    fetchChainHead(){
        return this.rpccli.call({method:'Chain.Head'});
    }
    fetchBlockByHash(hash){
      return this.rpccli.call({method:'Chain.GetBlockByHash', params: {
        hash: `${hash}`
      }});
    }
    fetchBlockByNumber(number){
      return this.rpccli.call({method:'Chain.GetBlockByNumber', params: {
        number: `${number}`
      }});
    }
    async fetchLatestTransactions(latestHeight, count) {
        if (latestHeight < 0 || count < 0) {
          return null;
        }
        const arr = [];
        for (let i=latestHeight, j=0; i >= 0 && (latestHeight - i) < 10;  i--) {
          var blk = await this.rpccli.call({method:'Chain.GetBlockByNumber', params: {
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

    async fetchBlockByHash(hash) {
        if (!hash || hash.length === 0){
          return null;
        }
        let blk = await this.rpccli.call({
            method: 'Chain.GetBlockByHash',
            params: {
              hash: `${hash}`
            }
        });
        return coverBlock(blk);
    }
    async fetchHeightBlocks(from, count) {
        if (from < 0) {
          from = 0
        }
        if (count < 0) {
          return null;
        }
        const arr = [];
        for (let i = from, j=0; i > from - count && j < from+1; i--, j++) {
          var blks = await this.rpccli.call({
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
        return coverHeightBlocks(arr);
    }
}

module.exports = Service;