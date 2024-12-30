import { getNodeById } from "../prisma/node"
import { fetchTaskById } from "../prisma/task"
import { emitNewTask } from "../socketio/emmiter"

export const simpleTaskManager = async (taskId: string) => {
  try {
    const pendingTask = await fetchTaskById(taskId)
    if (!pendingTask || !pendingTask.nodeId) {
      throw new Error("Task not found")
    }

    const node = await getNodeById(pendingTask.nodeId)
    if (!node || !node.socketId) throw new Error("No active nodes found")

    emitNewTask(node.socketId, pendingTask)
  } catch (err) {
    console.log(err)
  }
}
