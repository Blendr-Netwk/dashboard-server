"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBalance = exports.updateNonce = exports.getUserById = exports.getUser = exports.updateSSHPublicKey = exports.updateUsername = exports.createUser = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createUser = async (publicAddress) => {
    let user = await prisma.user.findUnique({ where: { publicAddress } });
    if (!user) {
        user = await prisma.user.create({
            data: {
                nonce: Math.floor(Math.random() * 10000),
                publicAddress,
                username: "",
                email: "",
            },
        });
    }
    return {
        nonce: user.nonce,
        publicAddress: user.publicAddress,
    };
};
exports.createUser = createUser;
const updateUsername = async (userId, username) => {
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { username },
    });
    return updatedUser;
};
exports.updateUsername = updateUsername;
const updateSSHPublicKey = async (userId, sshPublicKey) => {
    return await prisma.user.update({
        where: { id: userId },
        data: { sshPublicKey }
    });
};
exports.updateSSHPublicKey = updateSSHPublicKey;
const getUser = async (publicAddress) => {
    const user = await prisma.user.findUnique({
        where: { publicAddress }, select: {
            id: true,
            email: true,
            username: true,
            publicAddress: true,
            nonce: true,
            balance: true,
            sshPublicKey: true
        },
    });
    return user;
};
exports.getUser = getUser;
const getUserById = async (userId) => {
    return await prisma.user.findUnique({
        where: { id: userId }
    });
};
exports.getUserById = getUserById;
const updateNonce = async (publicAddress) => {
    const nonce = Math.floor(Math.random() * 10000);
    const user = await prisma.user.update({
        where: { publicAddress },
        data: { nonce },
    });
    return user;
};
exports.updateNonce = updateNonce;
const updateBalance = async (userId, type, amount) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new Error("User not found");
    }
    let currentBalance = user.balance || 0;
    if (type === "ADD")
        currentBalance += amount;
    else if (type === "MINUS")
        currentBalance -= amount;
    else
        throw new Error("Invalid type");
    return await prisma.user.update({
        where: { id: userId },
        data: { balance: currentBalance }
    });
};
exports.updateBalance = updateBalance;
