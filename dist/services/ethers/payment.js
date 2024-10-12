"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTokenPayment = exports.verifyPayment = void 0;
const ethers_1 = require("ethers");
const main_1 = require("./main");
const constant_1 = require("@/constant");
const erc20_json_1 = __importDefault(require("@/data/abi/erc20.json"));
const verifyPayment = async (txHash) => {
    const provider = await (0, main_1.getEtherProvider)();
    const [transaction, receipt] = await Promise.all([
        provider.getTransaction(txHash),
        provider.getTransactionReceipt(txHash)
    ]);
    if (!transaction || !receipt) {
        throw new Error("Transaction not found or receipt unavailable");
    }
    if (receipt.status === 0) {
        throw new Error("Transaction failed");
    }
    if (receipt.to?.toLowerCase() !== constant_1.ADMIN_ADDRESS.toLowerCase()) {
        throw new Error("Payment not received by admin");
    }
    return {
        from: transaction.from,
        to: transaction.to,
        value: ethers_1.ethers.formatEther(transaction.value)
    };
};
exports.verifyPayment = verifyPayment;
const verifyTokenPayment = async (txHash) => {
    const provider = await (0, main_1.getEtherProvider)();
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) {
        throw new Error("Transaction not found");
    }
    if (receipt.status === 0) {
        throw new Error("Transaction failed");
    }
    if ((receipt.to)?.toLowerCase() !== constant_1.TOKEN_ADDRESS.toLowerCase()) {
        throw new Error("in valid token address");
    }
    const erc20Interface = new ethers_1.ethers.Interface(erc20_json_1.default);
    const transferEventSignature = ethers_1.ethers.id("Transfer(address,address,uint256)");
    const transferEvent = receipt.logs.find(log => log.topics[0] === transferEventSignature);
    if (!transferEvent) {
        throw new Error("No transfer event found in the transaction");
    }
    const decodedEvent = erc20Interface.decodeEventLog("Transfer", transferEvent.data, transferEvent.topics);
    const [from, to, value] = [
        decodedEvent[0],
        decodedEvent[1],
        decodedEvent[2].toString()
    ];
    if (to.toLowerCase() !== constant_1.ADMIN_ADDRESS.toLowerCase()) {
        throw new Error("Payment not received by admin");
    }
    return {
        from,
        to,
        value
    };
};
exports.verifyTokenPayment = verifyTokenPayment;
