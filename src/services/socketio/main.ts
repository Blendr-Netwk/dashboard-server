import { Server } from "socket.io"
import { handleDisconnect, handleInitiateNode } from "./handler"
import { verifyToken } from "@/middleware"
import { pubClient } from "../redis"
import { addLogToTask } from "../prisma/task/logs"
import { freeTheNode } from "../prisma/node"
import { addReward, endReward, startReward } from "../reward"

export const initalizeSocketIO = async (io: Server) => {
  const mainIO = io.of("/")
  const REWARD_DURATION = 5000 // 60 * 60 * 1000

  io.use(async (socket, next) => {
    try {
      const authHeader = socket.handshake.headers.authorization
      const token = authHeader && authHeader.split(" ")[1]

      if (!token || token === "" || token == undefined)
        throw new Error("no token")

      if (!token) {
        return next(new Error("No token provided"))
      }
      const user = await verifyToken(token)
      socket.user = user
      next()
    } catch (err) {
      console.log(err)
      socket.emit("BMAIN: error", { message: "Invalid Token" })
      socket.disconnect(true)
      next(new Error("Invalid Token"))
    }
  })

  mainIO.on("connection", (socket) => {
    const socketId = socket.id
    const userId = socket.user.id

    console.log("New Connection: ", socketId)
    pubClient.set(`userId:${userId}`, socketId)

    // Set up interval to check for rewards every hour
    const rewardInterval = setInterval(async () => {
      console.log("Add reward")

      const rewardAmount = 1
      const rewardId = await pubClient.get(`rewardId:${userId}`)
      if (!rewardId) return
      await addReward(rewardId, rewardAmount)

      // Emit an event to inform the user about the reward
      mainIO.to(socketId).emit("BMAIN: REWARD", {
        message: `You have received ${rewardAmount} reward token!`,
      })
    }, REWARD_DURATION)

    socket.on("initialconfig", async (data) => {
      try {
        const response = await handleInitiateNode(socketId, userId, data)
        const reward = await startReward(userId, response.id)
        await pubClient.set(`rewardId:${userId}`, reward.id)

        socket.emit("BMAIN: initialconfig", response)
      } catch (err) {
        socket.emit("BMAIN: error", { message: "Error in initial config" })
        console.log(err)
      }
    })

    socket.on("BMAIN: logs", (data) => {
      addLogToTask(data.taskId, {
        message: data.message,
        timestamp: new Date().toISOString(),
      })
      console.log(data)
    })

    socket.on("BMAIN: execute_error", async (data) => {
      console.log(data)
      await freeTheNode(socketId)
    })

    // socket.on("test", (data) => {
    //     socket.emit("task_update", `Echo back: ${data.message}`);
    // });

    socket.on("disconnect", async () => {
      console.log("Disconnect: ", socketId)
      try {
        await pubClient.del(`userId:${userId}`)

        await handleDisconnect(socketId)

        clearInterval(rewardInterval)
        const rewardId = await pubClient.get(`rewardId:${userId}`)
        await pubClient.del(`rewardId:${userId}`)
        if (!rewardId) return
        await endReward(rewardId)
      } catch (err) {
        console.log(err)
      }
    })
  })
}
