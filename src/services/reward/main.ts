import { Reward } from "@prisma/client"
import { generateSignature } from "../ethers/signature"
import {
  updateRewardAmount,
  createReward,
  getUserRewards,
  updateRewardEndDate,
  updateClaimedAmount,
} from "../prisma/reward"
import { getUserByAddress, getUserById } from "../prisma/user"

export const startReward = async (userId: string, nodeId: string) => {
  return await createReward(userId, nodeId)
}

export const addReward = async (id: string, amount: number) => {
  return await updateRewardAmount(id, amount)
}

export const endReward = async (id: string) => {
  return await updateRewardEndDate(id)
}

export const getUserTotalReward = async (userId: string) => {
  const rewards = await getUserRewards(userId)
  const amountToClaim = rewards.reduce((amt: number, reward: Reward) => {
    const unclaimedAmount = reward.amount - reward.claimedAmount
    return amt + unclaimedAmount
  }, 0)

  return amountToClaim
}

export const claimUserReward = async (userId: string) => {
  const user = await getUserById(userId)
  if (!user) throw new Error("user not found")

  const rewards = await getUserRewards(userId)
  const amountToClaim = rewards.reduce((amt: number, reward: Reward) => {
    const unclaimedAmount = reward.amount - reward.claimedAmount
    return amt + unclaimedAmount
  }, 0)

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
