import {
  lendNodeGpu,
  rentNodeGpu,
  rentRefund,
  rentClaim,
} from "@/services/nodeManager"
import {
  fetchAllActiveNodes,
  fetchAllNodes,
  fetchMyNodes,
  fetchMyRentalNodes,
  updateNodeStatusAfterRent,
} from "@/services/prisma/node"
import { fetchTasks, saveTask } from "@/services/prisma/task"
import { simpleTaskManager } from "@/services/taskManager"
import { NextFunction, Request, Response } from "express"

class NodeController {
  public async getAllNodes(req: Request, res: Response, next: NextFunction) {
    try {
      await updateNodeStatusAfterRent()
      const activeNodes = await fetchAllNodes()
      return res.status(200).send(activeNodes)
    } catch (err) {
      next(err)
      return
    }
  }

  public async getAllActiveNodes(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const activeNodes = await fetchAllActiveNodes()
      return res.status(200).send(activeNodes)
    } catch (err) {
      next(err)
      return
    }
  }

  public async getMyNodes(req: Request, res: Response, next: NextFunction) {
    try {
      const nodes = await fetchMyNodes(req.user.id)
      return res.status(200).send(nodes)
    } catch (err) {
      next(err)
      return
    }
  }

  public async getMyRentalNodes(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      await updateNodeStatusAfterRent()
      const nodes = await fetchMyRentalNodes(req.user.id)
      return res.status(200).send(nodes)
    } catch (err) {
      next(err)
      return
    }
  }

  public async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const tasks = await fetchTasks(req.user.id)

      return res.status(200).send({ success: true, data: tasks })
    } catch (err) {
      next(err)
      return
    }
  }

  public async addNewTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { task, aiModel } = await saveTask(req.user.id, req.body)

      await simpleTaskManager(task.id)

      return res
        .status(200)
        .send({ success: "Task added successfully", data: { task, aiModel } })
    } catch (err) {
      next(err)
      return
    }
  }

  public async lendGpu(req: Request, res: Response, next: NextFunction) {
    try {
      const { nodeId, duration } = req.body
      if (!nodeId) throw new Error("Node not found")

      const response = await lendNodeGpu(req.user.id, nodeId, duration)

      return res
        .status(200)
        .send({ success: "Lended successfully", data: response })
    } catch (err) {
      next(err)
      return
    }
  }

  public async rentGpu(req: Request, res: Response, next: NextFunction) {
    try {
      const { nodeId, rentalId, duration } = req.body
      if (!nodeId) throw new Error("Node not found")

      const response = await rentNodeGpu(
        req.user.id,
        nodeId,
        rentalId,
        duration
      )

      return res.status(200).send({ success: true, data: response })
    } catch (err) {
      next(err)
      return
    }
  }

  public async rentClaim(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await rentClaim(req.user.id)
      return res.status(200).send({ success: true, data: response })
    } catch (err) {
      next(err)
      return
    }
  }

  public async rentRefund(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await rentRefund(req.user.id)
      return res.status(200).send({ success: true, data: response })
    } catch (err) {
      next(err)
      return
    }
  }
}

export default NodeController
