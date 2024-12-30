import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const getRentByRentalId = (rentalId: number) => {
  return prisma.rent.findFirst({
    where: {
      rentalId,
    },
  })
}

export const saveRent = (
  rentedById: string,
  nodeId: string,
  rentalId: number,
  amount: number,
  duration: number
) => {
  const endDate = new Date()
  endDate.setHours(endDate.getHours() + duration)

  return prisma.rent.create({
    data: {
      rentedById,
      nodeId,
      rentalId,
      amount,
      duration,
      startDate: new Date(),
      endDate,
    },
  })
}

export const getClaimableRents = (userId: string) => {
  return prisma.rent.findMany({
    where: {
      isValid: true,
      isClaimed: false,
      endDate: {
        lt: new Date(),
      },
      node: {
        ownerId: userId,
      },
    },
  })
}

export const claimRents = async (userId: string) => {
  const claimableRents = await getClaimableRents(userId)
  const updatePromises = claimableRents.map((rent) => {
    return prisma.rent.update({
      where: { id: rent.id }, 
      data: { isClaimed: true },
    })
  })

  return Promise.all(updatePromises)
}