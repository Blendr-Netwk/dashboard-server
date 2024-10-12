import { disconnectNode, registerNode } from "@/services/prisma/node"


export const handleInitiateNode = async (socketId: string, userId: string, data: any) => {
    await registerNode(socketId,userId, data)
}
export const handleDisconnect = async (socketId: string) => {
    await disconnectNode(socketId)
}