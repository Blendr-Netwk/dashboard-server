"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transaction_1 = require("@/services/prisma/transaction");
class TransactionController {
    async getMyTransactions(req, res, next) {
        try {
            const txs = await (0, transaction_1.fetchMyTransactions)(req.user.id);
            res.status(200).send(txs);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.default = TransactionController;
