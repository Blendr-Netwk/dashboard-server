"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nodeManager_1 = require("@/services/nodeManager");
const node_1 = require("@/services/prisma/node");
const task_1 = require("@/services/prisma/task");
const taskManager_1 = require("@/services/taskManager");
class NodeController {
    async getAllNodes(req, res, next) {
        try {
            const activeNodes = await (0, node_1.fetchAllNodes)();
            return res.status(200).send(activeNodes);
        }
        catch (err) {
            next(err);
            return;
        }
    }
    async getAllActiveNodes(req, res, next) {
        try {
            const activeNodes = await (0, node_1.fetchAllActiveNodes)();
            return res.status(200).send(activeNodes);
        }
        catch (err) {
            next(err);
            return;
        }
    }
    async getMyNodes(req, res, next) {
        try {
            const nodes = await (0, node_1.fetchMyNodes)(req.user.id);
            return res.status(200).send(nodes);
        }
        catch (err) {
            next(err);
            return;
        }
    }
    async getMyRentalNodes(req, res, next) {
        try {
            const nodes = await (0, node_1.fetchMyRentalNodes)(req.user.id);
            return res.status(200).send(nodes);
        }
        catch (err) {
            next(err);
            return;
        }
    }
    async addNewTask(req, res, next) {
        try {
            const { task, aiModel } = await (0, task_1.saveTask)(req.user.id, req.body);
            await (0, taskManager_1.simpleTaskManager)(task.id);
            return res.status(200).send({ sucess: "Task added successfully", data: { task, aiModel } });
        }
        catch (err) {
            next(err);
            return;
        }
    }
    async lendGpu(req, res, next) {
        try {
            const { nodeId, duration } = req.body;
            if (!nodeId)
                throw new Error("Node not found");
            const response = await (0, nodeManager_1.lendNodeGpu)(req.user.id, nodeId, duration);
            return res.status(200).send({ sucess: "Lended successfully", data: response });
        }
        catch (err) {
            next(err);
            return;
        }
    }
}
exports.default = NodeController;
