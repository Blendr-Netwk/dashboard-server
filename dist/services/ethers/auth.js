"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyMessage = void 0;
const ethers_1 = require("ethers");
const app_1 = require("@/constant/app");
const verifyMessage = (nonce, signature) => {
    const message = `Please sign this message to connect to ${app_1.APP_NAME}(${nonce})`;
    return ethers_1.ethers.verifyMessage(message, signature);
};
exports.verifyMessage = verifyMessage;
