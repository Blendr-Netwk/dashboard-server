"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logs_1 = require("@/services/prisma/task/logs");
class LogController {
    async getLogs(req, res, next) {
        try {
            const logs = await (0, logs_1.fetchLogsOfTask)(req.params.taskId);
            return res.status(200).send(logs);
        }
        catch (err) {
            next(err);
            return;
        }
    }
}
exports.default = LogController;
