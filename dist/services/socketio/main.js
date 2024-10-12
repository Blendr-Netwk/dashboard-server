"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initalizeSocketIO = void 0;
const handler_1 = require("./handler");
const middleware_1 = require("@/middleware");
const redis_1 = require("../redis");
const logs_1 = require("../prisma/task/logs");
const node_1 = require("../prisma/node");
const initalizeSocketIO = async (io) => {
    const mainIO = io.of("/");
    // const mainAdapter = mainIO.adapter;
    //Other namespaces
    // const taskIO = io.of("/task");
    // const taskAdapter = taskIO.adapter;
    io.use(async (socket, next) => {
        try {
            const authHeader = socket.handshake.headers.authorization;
            const token = authHeader && authHeader.split(" ")[1];
            if (!token || token === "" || token == undefined)
                throw new Error("no token");
            if (!token) {
                return next(new Error('No token provided'));
            }
            const user = await (0, middleware_1.verifyToken)(token);
            socket.user = user;
            next();
        }
        catch (err) {
            console.log(err);
            socket.emit('BMAIN: error', { message: "Invalid Token" });
            socket.disconnect(true);
            next(new Error("Invalid Token"));
        }
    });
    mainIO.on("connection", (socket) => {
        console.log("New Connection: ", socket.id);
        redis_1.pubClient.set(`userId:${socket.user.id}`, socket.id);
        socket.on("initialconfig", async (data) => {
            try {
                const response = await (0, handler_1.handleInitiateNode)(socket.id, socket.user.id, data);
                socket.emit("BMAIN: initialconfig", response);
            }
            catch (err) {
                socket.emit("BMAIN: error", { message: "Error in initial config" });
                console.log(err);
            }
        });
        socket.on("BMAIN: logs", (data) => {
            (0, logs_1.addLogToTask)(data.taskId, {
                message: data.message,
                timestamp: new Date().toISOString()
            });
            console.log(data);
        });
        socket.on("BMAIN: execute_error", async (data) => {
            console.log(data);
            await (0, node_1.freeTheNode)(socket.id);
        });
        // socket.on("test", (data) => {
        //     socket.emit("task_update", `Echo back: ${data.message}`);
        // });
        socket.on("disconnect", () => {
            try {
                redis_1.pubClient.del(`userId:${socket.user.id}`);
                const response = (0, handler_1.handleDisconnect)(socket.id);
            }
            catch (err) {
                console.log(err);
            }
        });
    });
};
exports.initalizeSocketIO = initalizeSocketIO;
