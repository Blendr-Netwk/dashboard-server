import { Server } from 'socket.io'
import { handleDisconnect, handleInitiateNode } from './handler';
import { verifyToken } from '@/middleware';
import { pubClient } from '../redis';
import { addLogToTask } from '../prisma/task/logs';
import { freeTheNode } from '../prisma/node';


export const initalizeSocketIO = async (io: Server) => {

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
            const user = await verifyToken(token)
            socket.user = user
            next()
        } catch (err) {
            console.log(err)
            socket.emit('BMAIN: error', { message: "Invalid Token" });
            socket.disconnect(true);
            next(new Error("Invalid Token"))
        }

    });


    mainIO.on("connection", (socket) => {
        console.log("New Connection: ", socket.id);
        pubClient.set(`userId:${socket.user.id}`, socket.id);

        socket.on("initialconfig", async (data) => {
            try {
                const response = await handleInitiateNode(socket.id, socket.user.id, data)
                socket.emit("BMAIN: initialconfig", response);
            } catch (err) {
                socket.emit("BMAIN: error", { message: "Error in initial config" });
                console.log(err)
            }
        });

        socket.on("BMAIN: logs", (data) => {
            addLogToTask(data.taskId, {
                message: data.message,
                timestamp: new Date().toISOString()
            })
            console.log(data)
        });

        socket.on("BMAIN: execute_error", async (data) => {
            console.log(data)
            await freeTheNode(socket.id)
        });

        // socket.on("test", (data) => {
        //     socket.emit("task_update", `Echo back: ${data.message}`);
        // });

        socket.on("disconnect", () => {
            try {
                pubClient.del(`userId:${socket.user.id}`);
                const response = handleDisconnect(socket.id)
            } catch (err) {
                console.log(err)
            }
        });
    });



}