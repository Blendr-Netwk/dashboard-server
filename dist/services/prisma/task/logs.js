"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchLogsOfTask = exports.addLogToTask = exports.FullLogs = void 0;
const main_1 = require("../main");
exports.FullLogs = {};
async function addLogToTask(taskId, logEntry) {
    if (!exports.FullLogs[taskId]) {
        exports.FullLogs[taskId] = [];
    }
    exports.FullLogs[taskId].push(logEntry);
    const task = await main_1.prisma.task.findUnique({
        where: { id: taskId },
        select: { logs: true }
    });
    if (!task) {
        throw new Error(`Task with ID ${taskId} not found.`);
    }
    await main_1.prisma.task.update({
        where: { id: taskId },
        data: { logs: exports.FullLogs[taskId] }
    });
    console.log(`Log entry added to task ${taskId}`);
}
exports.addLogToTask = addLogToTask;
const fetchLogsOfTask = async (taskId) => {
    return await main_1.prisma.task.findUnique({
        where: {
            id: taskId
        },
        select: {
            logs: true
        }
    });
};
exports.fetchLogsOfTask = fetchLogsOfTask;
