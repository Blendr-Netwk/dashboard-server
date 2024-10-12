"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("module-alias/register");
const app_1 = require("./app");
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const redis_1 = require("./services/redis");
const config_1 = require("./config");
const socketio_1 = require("./services/socketio");
const instanceScheduler_1 = require("./services/instanceScheduler");
const main = async () => {
    const app = (0, app_1.createApp)();
    //  await ConfigPassport(app)
    const instanceScheduler = new instanceScheduler_1.InstanceScheduler();
    const httpServer = (0, http_1.createServer)(app);
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "*"
        }
    });
    // io.attachApp(httpServer);
    await redis_1.pubClient.connect();
    await redis_1.subClient.connect();
    io.adapter((0, redis_adapter_1.createAdapter)(redis_1.pubClient, redis_1.subClient));
    (0, socketio_1.initalizeSocketIO)(io);
    instanceScheduler.start();
    httpServer.listen(parseInt(config_1.PORT), () => {
        // logger.info(`server started on localhost:${PORT}`);
        console.log(`server started on http://localhost:${config_1.PORT}`);
    });
};
main().catch((err) => {
    console.log(err);
    //logger.error(err);
});
