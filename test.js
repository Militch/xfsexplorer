const BN = require('bn.js');

function bitsUnzip(num) {
    let nn = new BN(num);
    const flag = new BN('ffffff00', 16);
    let mantissa = nn.and(flag);
    mantissa = mantissa.shrn(8);
    let e = num & 0xff;
    let c = 3;
    let bn = new BN(0);
    if (e <= c ){
        let shift = 8 * (c - e);
        mantissa = mantissa.shrn(shift);
        bn = mantissa;
    } else {
        bn = mantissa;
        let shift = 8 * (e - c);
        bn = bn.shln(shift);
    }
    return bn;
}

function calcDifficulty(x, y) {
    let xbn = bitsUnzip(x);
    let ybn = bitsUnzip(y);
    return xbn.div(ybn);
}
let a = calcDifficulty(4278190109, 4278190108);
console.log(a.toString(10));