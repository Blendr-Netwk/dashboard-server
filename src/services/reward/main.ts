import { REWARD_DURATION, REWARD_LENDS, REWARD_PENALTY } from "@/constant"
import { Reward } from "@prisma/client"
import { generateSignature } from "../ethers/signature"
import { fetchMyNodesWithReward } from "../prisma/node"
import {
  createReward,
  getRewardById,
  getUserRewards,
  updateClaimedAmount,
  updateRewardAmount,
  updateRewardEndDate,
} from "../prisma/reward"
import { getUserByAddress, getUserById } from "../prisma/user"

interface RewardContext {
  mainIO: any
  socketId: string
}

export class RewardService {
  private context: RewardContext
  private rewardIntervalId: NodeJS.Timeout | null = null
  private rewardId: string | null = null

  constructor(context: RewardContext) {
    this.context = context
  }

  start = async (userId: string, nodeId: string) => {
    const { mainIO, socketId } = this.context

    const reward = await createReward(userId, nodeId)
    this.rewardId = reward.id

    this.rewardIntervalId = setInterval(async () => {
      const rewardId = this.rewardId
      if (!rewardId) return

      const reward = await getRewardById(rewardId)
      if (!reward) throw new Error("Reward not found")

      const now = new Date()
      const startDate = reward.startDate

      const rewardLendId = reward.node.rewardLendId
      const rewardLend = REWARD_LENDS.find((r) => r.id === rewardLendId)
      if (!rewardLend) throw new Error("Invalid lend period")

      const lendPeriod = rewardLend.lendPeriod
      const rewardPeriod = now.getTime() - startDate.getTime()
      const isMultiply = rewardPeriod > lendPeriod
      const rewardAmount = isMultiply
        ? rewardLend.amount * rewardLend.multiply
        : rewardLend.amount

      await updateRewardAmount(rewardId, rewardAmount)

      console.log("Add Reward: ", socketId)
      mainIO.to(socketId).emit("BMAIN: REWARD", {
        message: `You have received ${rewardAmount} reward token!`,
      })
    }, REWARD_DURATION)
  }

  addReward = async () => {
    const { mainIO, socketId } = this.context

    const rewardId = this.rewardId
    if (!rewardId) return

    const reward = await getRewardById(rewardId)
    if (!reward) throw new Error("Reward not found")

    const rewardAmount = 5

    await updateRewardAmount(rewardId, rewardAmount)

    console.log("Add Reward: ", socketId)
    mainIO.to(socketId).emit("BMAIN: REWARD", {
      message: `You have received ${rewardAmount} reward token!`,
    })
  }

  end = async (userId: string) => {
    if (!this.rewardIntervalId) return
    clearInterval(this.rewardIntervalId)
    this.rewardIntervalId = null

    const rewardId = this.rewardId
    if (!rewardId) return

    const reward = await getRewardById(rewardId)

    if (!reward) throw new Error("Reward not found")

    const startDate = reward.startDate
    const endDate = new Date()

    const rewardLendId = reward.node.rewardLendId
    const rewardLend = REWARD_LENDS.find((r) => r.id === rewardLendId)
    if (!rewardLend) throw new Error("Invalid lend period")

    const lendPeriod = rewardLend.lendPeriod
    const rewardPeriod = endDate.getTime() - startDate.getTime()
    const isPenalty = rewardPeriod < lendPeriod
    const rewardAmount = isPenalty
      ? reward.amount * REWARD_PENALTY
      : reward.amount

    const PenaltyAmount = isPenalty ? reward.amount - rewardAmount : 0

    await updateRewardEndDate(rewardId, rewardAmount, PenaltyAmount, endDate)

    if (isPenalty) {
      console.log(`Penalty for userId ${userId} due to short lend period.`)
    }
    this.rewardId = null
  }
}

export const getUserNodeRewards = async (userId: string) => {
  const nodes = await fetchMyNodesWithReward(userId)
  const result = []

  for (const node of nodes) {
    const rewardLendId = node.rewardLendId
    const rewardLend = REWARD_LENDS.find((r) => r.id === rewardLendId)
    if (!rewardLend) continue

    const isConnected = node.isConnected

    const startDate = isConnected
      ? node.rewards.reduce((latest, reward) => {
          return reward.startDate > latest ? reward.startDate : latest
        }, new Date(0))
      : null

    const lendPeriod = startDate
      ? new Date(startDate.getTime() + rewardLend.lendPeriod)
      : null

    const { totalPenaltyAmount, totalRewardAmount } = node.rewards.reduce(
      (acc, reward) => {
        acc.totalPenaltyAmount += reward.penaltyAmount || 0
        acc.totalRewardAmount += reward.amount || 0
        return acc
      },
      { totalPenaltyAmount: 0, totalRewardAmount: 0 }
    )

    result.push({
      id: node.id,
      name: node.name,
      status: node.status,
      isConnected,
      totalRewardAmount,
      totalPenaltyAmount,
      startDate,
      lendPeriod,
    })
  }

  result.sort((a, b) => {
    if (a.isConnected === b.isConnected) return 0
    return a.isConnected ? -1 : 1
  })

  return result
}

export const getUserTotalReward = async (userId: string) => {
  const rewards = await getUserRewards(userId)

  const result = rewards.reduce(
    (
      acc: {
        amountToClaim: number
        claimedAmount: number
        estimateToClaim: number
      },
      reward: Record<string, any>
    ) => {
      const rewardLendId = reward.node.rewardLendId
      const rewardLend = REWARD_LENDS.find((r) => r.id === rewardLendId)
      if (!rewardLend) throw new Error("Invalid lend period")

      const now = new Date()
      const startDate = reward.startDate

      const lendPeriod = rewardLend.lendPeriod
      const rewardPeriod = now.getTime() - startDate.getTime()
      const isValid = reward.endDate || rewardPeriod > lendPeriod

      const unclaimedAmount = isValid ? reward.amount - reward.claimedAmount : 0
      acc.amountToClaim += unclaimedAmount
      acc.claimedAmount += reward.claimedAmount
      acc.estimateToClaim += reward.amount - reward.claimedAmount
      return acc
    },
    { amountToClaim: 0, claimedAmount: 0, estimateToClaim: 0 }
  )

  return result
}

export const claimUserReward = async (userId: string) => {
  const user = await getUserById(userId)
  if (!user) throw new Error("user not found")

  const rewards = await getUserTotalReward(userId)
  const amountToClaim = rewards.amountToClaim

  if (!amountToClaim)
    throw new Error("Reward must be greater than zero to claim.")

  return await generateSignature(
    user.publicAddress,
    amountToClaim,
    user.rewardNonce
  )
}

export const updateClaimReward = async (address: string, amount: string) => {
  const user = await getUserByAddress(address)
  if (!user) throw new Error("User not found.")
  const rewards = await getUserRewards(user.id)
  let remainingAmount = parseFloat(amount)

  const rewardsWithEndDate = rewards.filter(
    (reward: Reward) => reward.amount > reward.claimedAmount && reward.endDate
  )
  for (const reward of rewardsWithEndDate) {
    const unclaimedAmount = reward.amount - reward.claimedAmount
    const amountToClaim = Math.min(unclaimedAmount, remainingAmount)
    remainingAmount -= amountToClaim
    await updateClaimedAmount(reward.id, reward.claimedAmount + amountToClaim)
    if (remainingAmount <= 0) break
  }

  if (remainingAmount > 0) {
    const rewardsWithoutEndDate = rewards.filter(
      (reward: Reward) =>
        reward.amount > reward.claimedAmount && !reward.endDate
    )
    for (const reward of rewardsWithoutEndDate) {
      const unclaimedAmount = reward.amount - reward.claimedAmount
      const amountToClaim = Math.min(unclaimedAmount, remainingAmount)
      remainingAmount -= amountToClaim
      await updateClaimedAmount(reward.id, reward.claimedAmount + amountToClaim)
      if (remainingAmount <= 0) break
    }
  }
}
