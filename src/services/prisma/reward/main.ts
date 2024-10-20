import { prisma } from "../main"

export async function getRewardById(id: string) {
  return await prisma.reward.findUnique({ where: { id } })
}

export async function getRewardsByNodeId(nodeId: string) {
  return await prisma.reward.findMany({
    where: {
      nodeId,
    },
  })
}

export async function getUserRewards(userId: string) {
  return await prisma.reward.findMany({
    where: {
      userId,
    },
    include: {
      node: {
        select: {
          name: true,
        },
      },
    },
  })
}

export async function createReward(userId: string, nodeId: string) {
  return await prisma.reward.create({
    data: {
      userId,
      nodeId,
      startDate: new Date(),
    },
  })
}

export async function updateRewardAmount(id: string, amount: number) {
  return await prisma.reward.update({
    where: {
      id,
    },
    data: {
      amount: {
        increment: amount,
      },
    },
  })
}

export async function updateRewardEndDate(id: string) {
  return await prisma.reward.update({
    where: {
      id,
    },
    data: {
      endDate: new Date(),
    },
  })
}

export async function updateClaimedAmount(id: string, claimedAmount: number) {
  return await prisma.reward.update({
    where: {
      id,
    },
    data: {
      claimedAmount,
    },
  })
}
