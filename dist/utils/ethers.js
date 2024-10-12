"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weiToEth = void 0;
const ethers_1 = require("ethers");
function weiToEth(wei) {
    const eth = ethers_1.ethers.formatUnits(wei, 'ether');
    return Number(eth);
}
exports.weiToEth = weiToEth;
