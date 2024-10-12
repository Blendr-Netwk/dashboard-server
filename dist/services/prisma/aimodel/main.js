"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAiModels = void 0;
const main_1 = require("../main");
const getAllAiModels = async () => {
    return await main_1.prisma.aIModel.findMany();
};
exports.getAllAiModels = getAllAiModels;
