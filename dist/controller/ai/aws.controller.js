"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generate_1 = require("@/services/aws/generate");
const intances_1 = require("@/services/aws/intances");
const instance_1 = require("@/services/prisma/instance");
const transaction_1 = require("@/services/prisma/transaction");
const user_1 = require("@/services/prisma/user");
class AWSController {
    async generatePresignedUrl(req, res, next) {
        try {
            const { fileName, fileType } = req.body;
            if (!fileName || !fileType) {
                throw new Error("fileName and fileType are required");
            }
            const presignedUrl = await (0, generate_1.generateAwsPresignedUrl)(fileName, fileType);
            return res.status(200).json(presignedUrl);
        }
        catch (error) {
            next(error);
            return;
        }
    }
    async getAllAvailableInstances(req, res, next) {
        try {
            const instances = await (0, intances_1.fetchAllAwsInstances)();
            return res.status(200).json(instances);
        }
        catch (error) {
            next(error);
            return;
        }
    }
    async fetchAllInstanceTypes(req, res, next) {
        try {
            const instances = await (0, instance_1.fetchAllInstanceTypes)();
            return res.status(200).json(instances);
        }
        catch (error) {
            next(error);
            return;
        }
    }
    async createInstance(req, res, next) {
        try {
            const { instanceType, duration, txHash } = req.body;
            if (!instanceType || !duration || !txHash || duration < 6) {
                throw new Error("Invalid instance type or duration");
            }
            const txUsed = await (0, transaction_1.fetchTransactionsByHash)(txHash);
            if (txUsed) {
                throw new Error("Transaction used already");
            }
            const instances = await (0, instance_1.fetchInstanceByType)(instanceType);
            if (!instances) {
                throw new Error("Instance type not found");
            }
            const instancePrice = instances.price * duration;
            if (req.user.balance < instancePrice) {
                throw new Error("Insufficient balance");
            }
            // Deduct balance first to reserve funds
            await (0, user_1.updateBalance)(req.user.id, "MINUS", instancePrice);
            // Attempt to create AWS instance
            const { instance, keyPair } = await (0, intances_1.createAwsInstance)(req.user.id, instances.type);
            if (!instance || !instance.Instances || !instance.Instances[0]) {
                throw new Error("Instance creation failed");
            }
            const expireAt = new Date();
            expireAt.setHours(expireAt.getHours() + duration);
            const savedInstance = await (0, instance_1.saveInstance)(req.user.id, {
                instanceId: instance.Instances[0].InstanceId,
                instanceTypeId: instances.id,
                keyName: keyPair.KeyName,
                expireAt: expireAt,
                PublicIpAddress: ""
            });
            const savedKeyPair = await (0, instance_1.saveKeyPair)(req.user.id, savedInstance.instanceId, keyPair);
            await (0, transaction_1.saveTransaction)({
                txHash,
                from: req.user.publicAddress,
                to: instanceType,
                value: instancePrice,
                type: "payment",
                status: "success",
            }, req.user.id);
            return res.status(200).json({ keyPair: savedKeyPair, instance: savedInstance });
        }
        catch (error) {
            next(error);
            return;
        }
    }
    async getInstanceStatus(req, res, next) {
        try {
            const instance = await (0, intances_1.fetchInstanceStatus)(req.params.instanceId);
            return res.status(200).json(instance);
        }
        catch (error) {
            next(error);
            return;
        }
    }
    async getMyInstances(req, res, next) {
        try {
            const instance = await (0, instance_1.fetchMyInstances)(req.user.id);
            return res.status(200).json(instance);
        }
        catch (error) {
            next(error);
            return;
        }
    }
    async getMyKeyPair(req, res, next) {
        try {
            const instance = await (0, instance_1.fetchKeyPair)(req.user.id, req.params.keyName);
            return res.status(200).json(instance);
        }
        catch (error) {
            next(error);
            return;
        }
    }
    async test(req, res, next) {
        try {
            const instance = (0, instance_1.testEditFiles)();
            return res.status(200).json(instance);
        }
        catch (error) {
            next(error);
            return;
        }
    }
}
exports.default = AWSController;
