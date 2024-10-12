"use strict";
//TODO: SIMPLE TASK MANAGER
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleTaskManager = void 0;
const node_1 = require("../prisma/node");
const task_1 = require("../prisma/task");
const emmiter_1 = require("../socketio/emmiter");
const simpleTaskManager = async (taskId) => {
    try {
        const pendingTask = await (0, task_1.fetchTaskById)(taskId);
        const node = await (0, node_1.getAppropriateNode)(pendingTask);
        if (!node || !node.socketId)
            throw new Error("No active nodes found");
        (0, emmiter_1.emitNewTask)(node.socketId, pendingTask);
    }
    catch (err) {
        console.log(err);
    }
};
exports.simpleTaskManager = simpleTaskManager;
