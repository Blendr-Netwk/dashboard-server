import { generateRandomString } from "@/utils"
import { ethers } from "ethers"
import { getRentContract } from "../ethers/contract"
import { getNodeById, updateLendedNode, updateRentedNode } from "../prisma/node"
import {
  claimRents,
  getClaimableRents,
  getRentByRentalId,
  saveRent,
} from "../prisma/rent/main"
import { saveTransaction } from "../prisma/transaction"
import { getUserByAddress, getUserById, updateBalance } from "../prisma/user"
import { emitLendNode } from "../socketio/emmiter"
import { generateSignature } from "../ethers/signature"

export const lendNodeGpu = async (
  userId: string,
  nodeId: string,
  duration: number
) => {
  const node = await getNodeById(nodeId)
  const user = await getUserById(userId)

  if (!node) throw new Error("Node not found")
  if (!user) throw new Error("User not found")

  if (node.status !== "idle") {
    throw new Error("Node is not available")
  }
  if (!node.isConnected || !node.socketId) {
    throw new Error("Node is not connected")
  }
  if (!user.sshPublicKey) {
    throw new Error("User does not have SSH public key")
  }
  // const keys = generateKeyPair("user@host.com")

  // const savedKey = await saveKeyPair(userId, node.id, keys)

  const neededCredits = node.price * duration
  if (user.balance < neededCredits) {
    throw new Error("Insufficient balance")
  }
  await updateBalance(userId, "MINUS", neededCredits)

  await saveTransaction(
    {
      txHash: "0x00000" + generateRandomString(10),
      from: userId,
      to: node.id,
      value: neededCredits,
      type: "lend",
      status: "success",
    },
    userId
  )

  await updateLendedNode(node.id)

  emitLendNode(node.socketId, {
    publicKey: user.sshPublicKey,
    username: userId,
  })

  return {
    node,
  }
}

export const rentNodeGpu = async (
  userId: string,
  nodeId: string,
  rentalId: number,
  duration: number
) => {
  const node = await getNodeById(nodeId)
  const user = await getUserById(userId)

  if (!node) throw new Error("Node not found")
  if (!user) throw new Error("User not found")

  if (node.status !== "idle") {
    throw new Error("Node is not available")
  }

  if (!node.isConnected || !node.socketId) {
    throw new Error("Node is not connected")
  }

  const contract = await getRentContract()
  const rentalDetails = await contract.rentals(rentalId)
  const amount = rentalDetails[4].toString()

  if (!rentalDetails) {
    throw new Error("Rental not found")
  }
  const price = node.price * duration

  if (ethers.formatUnits(amount, 18) !== price.toString()) {
    throw new Error("Rental amount not equal")
  }

  const getRent = await getRentByRentalId(rentalId)
  if (getRent) throw new Error("Rental duplicated")

  await saveRent(userId, nodeId, rentalId, node.price, duration)
  const updatedNode = await updateRentedNode(node.id)

  return {
    ...updatedNode,
  }
}

export const rentClaim = async (userId: string) => {
  const user = await getUserById(userId)

  if (!user) throw new Error("User not found")

  const rents = await getClaimableRents(userId)

  if (rents.length === 0) {
    return 0
  }

  let totalAmount = 0

  for (const rent of rents) {
    const price = rent.amount * rent.duration
    totalAmount += price
  }

  if (totalAmount <= 0) {
    return 0
  }

  return await generateSignature(
    user.publicAddress,
    totalAmount,
    user.rentNonce
  )
}

export const updateRentClaim = async (address: string, amount: string) => {
  const user = await getUserByAddress(address)
  if (!user) throw new Error("User not found")
  await claimRents(user.id)
  return true
}

export const rentRefund = async (userId: string) => {
  const user = await getUserById(userId)

  if (!user) throw new Error("User not found")

  return null
}
