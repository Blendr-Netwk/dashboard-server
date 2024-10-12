"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lendNodeGpu = void 0;
// import { generateKeyPair } from "@/utils/keygen"
const utils_1 = require("@/utils");
const node_1 = require("../prisma/node");
const transaction_1 = require("../prisma/transaction");
const user_1 = require("../prisma/user");
const emmiter_1 = require("../socketio/emmiter");
// import { saveKeyPair } from "../prisma/instance"
const lendNodeGpu = async (userId, nodeId, duration) => {
    const node = await (0, node_1.getNodeById)(nodeId);
    const user = await (0, user_1.getUserById)(userId);
    if (!node)
        throw new Error("Node not found");
    if (!user)
        throw new Error("User not found");
    if (node.status !== "idle") {
        throw new Error("Node is not available");
    }
    if (!node.isConnected || !node.socketId) {
        throw new Error("Node is not connected");
    }
    if (!user.sshPublicKey) {
        throw new Error("User does not have SSH public key");
    }
    // const keys = generateKeyPair("user@host.com")
    // const savedKey = await saveKeyPair(userId, node.id, keys)
    const neededCredits = node.price * duration;
    if (user.balance < neededCredits) {
        throw new Error("Insufficient balance");
    }
    await (0, user_1.updateBalance)(userId, "MINUS", neededCredits);
    await (0, transaction_1.saveTransaction)({
        txHash: "0x00000" + ((0, utils_1.generateRandomString)(10)),
        from: userId,
        to: node.id,
        value: neededCredits,
        type: "lend",
        status: "success"
    }, userId);
    await (0, node_1.updateLendedNode)(userId, node.id, duration);
    (0, emmiter_1.emitLendNode)(node.socketId, {
        publicKey: user.sshPublicKey,
        username: userId
    });
    return {
        node
    };
};
exports.lendNodeGpu = lendNodeGpu;
