"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDisconnect = exports.handleInitiateNode = void 0;
const node_1 = require("@/services/prisma/node");
const handleInitiateNode = async (socketId, userId, data) => {
    await (0, node_1.registerNode)(socketId, userId, data);
};
exports.handleInitiateNode = handleInitiateNode;
const handleDisconnect = async (socketId) => {
    await (0, node_1.disconnectNode)(socketId);
};
exports.handleDisconnect = handleDisconnect;
