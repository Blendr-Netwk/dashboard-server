import { connectRedis, pubClient } from "@/services/redis"
import { Emitter } from "@socket.io/redis-emitter"

const emitter = new Emitter(pubClient)

const mainEmitter = emitter.of("/")

export const emitTest = (socketID: string, payload: any) => {
  mainEmitter.to(socketID).emit("BMAIN: test", payload)
}

export const emitNewTask = async (socketID: string, payload: any) => {
  try {
    if (!pubClient.isOpen) connectRedis()
    console.log("Emitting new task: ", socketID)
    await mainEmitter.to(socketID).emit("BMAIN: NEW_TASK", payload)
    console.log("New task emitted: ", socketID)
  } catch (e) {
    console.error("Error:", e)
  }
}

export const emitCommand = (socketID: string, payload: any) => {
  mainEmitter.to(socketID).emit("BMAIN: COMMAND'", payload)
}

export const emitLendNode = (socketID: string, payload: any) => {
  mainEmitter.to(socketID).emit("BMAIN: LEND_GPU", payload)
}

export const emitRevokeLendNode = (socketID: string, payload: any) => {
  mainEmitter.to(socketID).emit("BMAIN: REVOKE_LENDING", payload)
}
