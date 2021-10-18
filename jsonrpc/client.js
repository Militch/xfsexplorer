var axios = require('axios');

const JSONRPC_VER = '2.0';

class HttpJsonRpcClient {
    constructor(opts = {url:''}){
        this.url = opts.url;
        this.axioscli = axios.create({
            baseURL: this.url,
            timeout: 1000
        });
        // console.log(`call constructor url=${opts.url}`);
    }
    async call(opts = {method:'', params: null}) {
        // console.log(`call method url=${this.url} name=${opts.method}, params=`,opts.params);
        var resp = null;
        try {
            resp = await this.axioscli.post('/', this.packreq(opts));
        }catch (error) {
            console.log(`got err=`, error);
            throw new Error(error);
        }
        if (Object.keys(resp.data).indexOf('error') === 0) {
            throw new Error('some err');
        }
        if (resp.data.id !== 1){
            throw new Error('some err');
        }
        if (resp.data.jsonrpc !== JSONRPC_VER){
            throw new Error('some err');
        }
        // console.log(`got data.result=`, resp.data.result);
        return resp.data.result;
    }
    packreq({method,params}) {
        return {
            method: method,
            params: params,
            id: 1,
            jsonrpc: JSONRPC_VER
        }
    }


}

module.exports = HttpJsonRpcClient;