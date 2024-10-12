"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchTransactionsByHash = exports.fetchMyTransactions = exports.saveTransaction = void 0;
const main_1 = require("../main");
const saveTransaction = async (data, userId) => {
    return await main_1.prisma.transaction.create({
        data: {
            txHash: data.txHash,
            from: data.from,
            to: data.to,
            value: typeof data.value === 'number' ? data.value.toString() : data.value,
            type: data.type,
            status: data.status,
            userId: userId
        }
    });
};
exports.saveTransaction = saveTransaction;
const fetchMyTransactions = async (userId) => {
    return await main_1.prisma.transaction.findMany({
        where: {
            userId: userId
        }
    });
};
exports.fetchMyTransactions = fetchMyTransactions;
const fetchTransactionsByHash = async (txHash) => {
    const transaction = await main_1.prisma.transaction.findUnique({
        where: {
            txHash: txHash
        }
    });
    return transaction || null;
};
exports.fetchTransactionsByHash = fetchTransactionsByHash;
