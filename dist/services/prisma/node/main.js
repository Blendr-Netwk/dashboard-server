"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppropriateNode = exports.freeTheNode = exports.updateRemoveRentedNode = exports.updateLendedNode = exports.disconnectNode = exports.getNodeById = exports.registerNode = exports.fetchAllRentedNodes = exports.fetchMyRentalNodes = exports.fetchMyNodes = exports.fetchAllActiveNodes = exports.fetchAllNodes = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const fetchAllNodes = async () => {
    return await prisma.node.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    });
};
exports.fetchAllNodes = fetchAllNodes;
const fetchAllActiveNodes = async () => {
    return await prisma.node.findMany({
        where: {
            isConnected: true,
            status: "idle"
        }
    });
};
exports.fetchAllActiveNodes = fetchAllActiveNodes;
const fetchMyNodes = async (userId) => {
    return await prisma.node.findMany({
        where: {
            ownerId: userId
        }
    });
};
exports.fetchMyNodes = fetchMyNodes;
const fetchMyRentalNodes = async (userId) => {
    return await prisma.node.findMany({
        where: {
            rentedById: userId
        }
    });
};
exports.fetchMyRentalNodes = fetchMyRentalNodes;
const fetchAllRentedNodes = async () => {
    return await prisma.node.findMany({
        where: {
            status: "lended",
        }
    });
};
exports.fetchAllRentedNodes = fetchAllRentedNodes;
const registerNode = async (socketId, userId, data) => {
    //check if the node is already registered
    const existingNode = await prisma.node.findFirst({
        where: {
            name: data.node_name,
            ownerId: userId
        }
    });
    //update it if the data is new
    if (existingNode) {
        return await prisma.node.update({
            where: {
                id: existingNode.id
            },
            data: {
                isConnected: true,
                socketId: socketId,
                price: data.price,
                publicIp: data.public_ip,
                port: data.port
            }
        });
    }
    return await prisma.node.create({
        data: {
            name: data.node_name,
            gpu: data.gpu_info,
            cpu: data.cpu_info,
            storage: data.storage_info,
            status: "idle",
            isConnected: true,
            socketId: socketId,
            network: data.network_info,
            publicIp: data.public_ip,
            ownerId: userId,
            price: data.price,
            port: data.port
        }
    });
};
exports.registerNode = registerNode;
const getNodeById = async (id) => {
    return await prisma.node.findUnique({
        where: {
            id
        }
    });
};
exports.getNodeById = getNodeById;
const disconnectNode = async (socketId) => {
    try {
        const nodes = await prisma.node.findMany({
            where: {
                socketId: socketId
            }
        });
        if (nodes.length === 0) {
            return;
        }
        const updates = nodes.map((node) => {
            return prisma.node.update({
                where: { id: node.id },
                data: { isConnected: false, socketId: null },
            });
        });
        const results = await Promise.all(updates);
        return results;
    }
    catch (err) {
        console.log(err);
        return null;
    }
};
exports.disconnectNode = disconnectNode;
// export const updateLendedNode = (nodeId: string, keyName: string, duration: number) => {
const updateLendedNode = (userId, nodeId, duration) => {
    const expireAt = new Date();
    expireAt.setHours(expireAt.getHours() + duration);
    return prisma.node.update({
        where: {
            id: nodeId
        },
        data: {
            // keyName: keyName,
            rentedById: userId,
            status: "lended",
            expireAt: expireAt,
            startedAt: new Date()
        }
    });
};
exports.updateLendedNode = updateLendedNode;
const updateRemoveRentedNode = (nodeId) => {
    return prisma.node.update({
        where: {
            id: nodeId
        },
        data: {
            status: "idle",
            rentedById: null,
            expireAt: null,
            startedAt: null
        }
    });
};
exports.updateRemoveRentedNode = updateRemoveRentedNode;
const freeTheNode = async (socketId) => {
    try {
        const nodes = await prisma.node.findMany({
            where: {
                socketId: socketId
            }
        });
        if (nodes.length === 0) {
            return;
        }
        const updates = nodes.map((node) => {
            return prisma.node.update({
                where: { id: node.id },
                data: { status: 'idle' },
            });
        });
        const results = await Promise.all(updates);
        return results;
    }
    catch (err) {
        return [];
    }
};
exports.freeTheNode = freeTheNode;
const getAppropriateNode = async (pendingTask) => {
    const node = await prisma.node.findFirst({
        where: {
            isConnected: true,
            status: "idle"
        }
    });
    if (node) {
        await prisma.task.update({
            where: {
                id: pendingTask.id
            },
            data: {
                nodeId: node.id
            }
        });
        await prisma.node.update({
            where: {
                id: node.id
            },
            data: {
                status: "idle"
            }
        });
    }
    return node;
};
exports.getAppropriateNode = getAppropriateNode;
