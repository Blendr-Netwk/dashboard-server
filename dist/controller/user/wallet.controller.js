"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const payment_1 = require("@/services/ethers/payment");
const main_1 = require("@/services/prisma/price-pair/main");
const transaction_1 = require("@/services/prisma/transaction");
const user_1 = require("@/services/prisma/user");
class WalletController {
    async deposit(req, res, next) {
        try {
            const { txHash } = req.body;
            const verifiedPayment = await (0, payment_1.verifyPayment)(txHash);
            //checking if its sent by the acutal owner
            if (req.user.publicAddress !== verifiedPayment.from) {
                throw new Error("Invalid owner");
            }
            //check if its already exist
            const txUsed = await (0, transaction_1.fetchTransactionsByHash)(txHash);
            if (txUsed) {
                throw new Error("Transaction used already");
            }
            await (0, transaction_1.saveTransaction)({
                txHash,
                from: verifiedPayment.from,
                to: verifiedPayment.to,
                value: verifiedPayment.value,
                type: "deposit",
                status: "success",
            }, req.user.id);
            const ethRate = await (0, main_1.updatePricePair)();
            const valueInUSD = parseFloat(verifiedPayment.value) * ethRate.price;
            const updatedUser = await (0, user_1.updateBalance)(req.user.id, "ADD", valueInUSD);
            res.status(200).send({ balance: updatedUser.balance });
        }
        catch (err) {
            next(err);
        }
    }
    async withdraw(req, res, next) {
        try {
            const { amount } = req.body;
            // const verifiedPayment = await verifyPayment();
            // await saveTransaction({
            //     txHash,
            //     from: verifiedPayment.from,
            //     to: verifiedPayment.to,
            //     value: verifiedPayment.value,
            //     type: "deposit",
            //     status: "success",
            // }, req.user.id);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.default = WalletController;
