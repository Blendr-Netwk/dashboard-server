"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testEditFiles = exports.fetchKeyPair = exports.saveKeyPair = exports.fetchAllInstanceTypes = exports.saveInstanceType = exports.fetchInstanceByType = exports.fetchMyInstances = exports.updateInstance = exports.fetchRunningInstances = exports.updatePublicIpAddress = exports.saveInstance = void 0;
const main_1 = require("../main");
const saveInstance = async (userId, data) => {
    return await main_1.prisma.instance.create({
        data: {
            instanceId: data.instanceId,
            instanceTypeId: data.instanceTypeId,
            keyName: data.keyName,
            userId: userId,
            expireAt: data.expireAt,
            publicIp: data.publicIp
        }
    });
};
exports.saveInstance = saveInstance;
const updatePublicIpAddress = async (instanceId, publicIp) => {
    return await main_1.prisma.instance.update({
        where: {
            instanceId: instanceId
        },
        data: {
            publicIp: publicIp,
            status: "running"
        }
    });
};
exports.updatePublicIpAddress = updatePublicIpAddress;
const fetchRunningInstances = async () => {
    return await main_1.prisma.instance.findMany({
        where: {
            status: {
                in: ["running", "pending"]
            }
        }
    });
};
exports.fetchRunningInstances = fetchRunningInstances;
const updateInstance = async (instanceId, payload) => {
    return await main_1.prisma.instance.update({
        where: {
            id: instanceId
        },
        data: payload
    });
};
exports.updateInstance = updateInstance;
const fetchMyInstances = async (userId) => {
    return await main_1.prisma.instance.findMany({
        where: {
            userId: userId
        },
        include: {
            instanceType: true
        }
    });
};
exports.fetchMyInstances = fetchMyInstances;
// --------------
// Instsance Type
// --------------
const fetchInstanceByType = async (type) => {
    return main_1.prisma.instanceType.findFirst({
        where: {
            type: type
        }
    });
};
exports.fetchInstanceByType = fetchInstanceByType;
const saveInstanceType = async (instance, price) => {
    const data = await main_1.prisma.instanceType.create({
        data: {
            type: instance.type,
            cpu: {
                name: instance.cpu.Name,
                cores: instance.cpu.Cores,
                clockSpeedGHz: instance.cpu.ClockSpeedGHz
            },
            gpu: {
                name: instance.gpu.Name,
                count: instance.gpu.Count,
                totalMemoryMiB: instance.gpu.TotalMemoryMiB
            },
            network: {
                speed: instance.networkSpeed
            },
            storage: {
                totalGB: instance.totalStorageGB
            },
            price: price
        }
    });
    return data;
};
exports.saveInstanceType = saveInstanceType;
const fetchAllInstanceTypes = async () => {
    return main_1.prisma.instanceType.findMany({});
};
exports.fetchAllInstanceTypes = fetchAllInstanceTypes;
// --------------
// KEY PAIR
// --------------
const saveKeyPair = async (userId, instanceId, keyPair) => {
    // return await prisma.keyPair.create({
    //     data: {
    //         keyFingerprint: keyPair.KeyFingerprint,
    //         keyMaterial: keyPair.KeyMaterial,
    //         keyName: keyPair.KeyName,
    //         keyPairId: keyPair.KeyPairId ? keyPair.KeyPairId : "",
    //         instanceId: instanceId,
    //         publicKey: keyPair.publicKey ? keyPair.publicKey : "",
    //         userId: userId
    //     }
    // });
};
exports.saveKeyPair = saveKeyPair;
const fetchKeyPair = async (userId, keyName) => {
    const instance = await main_1.prisma.instance.findFirst({
        where: {
            keyName: keyName,
            userId: userId
        }
    });
    if (!instance) {
        throw new Error("Instance not found");
    }
    return await main_1.prisma.keyPair.findUnique({
        where: {
            keyName: keyName
        }
    });
};
exports.fetchKeyPair = fetchKeyPair;
const testEditFiles = async () => {
    const instanceTypes = await main_1.prisma.instanceType.findMany({});
    for (const instanceType of instanceTypes) {
        // const price = await getHourlyPrice(instanceType.type)
        // console.log(instanceType.type + ": " + price)
        //     const randomNetworkSpeed = Math.floor(Math.random() * (50 - 10 + 1) + 10);
        //     const network: any = instanceType.network
        //     // console.log(network)
        //     if (network.speed) {
        //         console.log(network)
        // await prisma.instanceType.update({
        //     where: {
        //         id: instanceType.id
        //     },
        //     data: {
        //         price: parseFloat(price.toFixed(2))
        //     }
        // });
    }
};
exports.testEditFiles = testEditFiles;
