"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEtherProvider = void 0;
const ethers_1 = require("ethers");
const constant_1 = require("../../constant");
const getEtherProvider = () => {
    return new ethers_1.ethers.JsonRpcProvider(constant_1.RPC_HTTP_URL);
};
exports.getEtherProvider = getEtherProvider;
