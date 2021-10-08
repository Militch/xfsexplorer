const BN = require('bn.js');
const { re } = require('mathjs');

exports.calcBlockReward = function (height) {
  return 50 << (height / 21000);
}

exports.coinFormat = function(num) {
    var formater = new Intl.NumberFormat("en-US",
    { style: "decimal",minimumFractionDigits: 4, maximumFractionDigits: 4 });
    return formater.format(num)
}

exports.baseNumberFormat = function(num) {
    var formater = new Intl.NumberFormat("en-US",
    { style: "decimal",minimumFractionDigits: 4, maximumFractionDigits: 4 });
    return formater.format(num)
}

exports.baseIntFormat = function(num) {
    var formater = new Intl.NumberFormat("en-US",
    { style: "decimal",minimumFractionDigits: 0, maximumFractionDigits: 0 });
    return formater.format(num)
}

exports.bitsUnzip = function(num) {
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

exports.calcDifficulty = function(x, y) {
    if (x === y) {
        return new BN(1);
    }
    let xbn = exports.bitsUnzip(x);
    let ybn = exports.bitsUnzip(y);
    return xbn.div(ybn);
}