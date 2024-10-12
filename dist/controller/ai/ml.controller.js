"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aimodel_1 = require("@/services/prisma/aimodel");
class MlController {
    async getAiModels(req, res, next) {
        try {
            const aiModels = await (0, aimodel_1.getAllAiModels)();
            return res.status(200).json(aiModels);
        }
        catch (error) {
            next(error);
            return;
        }
    }
}
exports.default = MlController;
