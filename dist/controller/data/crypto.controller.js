"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("@/services/prisma/price-pair/main");
class CryptoDataController {
    async fetchRates(req, res, next) {
        try {
            const response = await (0, main_1.updatePricePair)();
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = CryptoDataController;
