import { RENT_ADDRESS, REWARD_ADDRESS } from "@/constant"
import rentABI from "@/data/abi/rent.json"
import rewardABI from "@/data/abi/reward.json"
import { ethers } from "ethers"
import { updateRentClaim } from "../nodeManager"
import { updateUserRentNonce, updateUserRewardNonce } from "../prisma/user"
import { updateClaimReward } from "../reward"
import { getEtherProvider } from "./main"

export const event = () => {
  const provider = getEtherProvider()
  const contract = new ethers.Contract(REWARD_ADDRESS, rewardABI, provider)
  const gpuContract = new ethers.Contract(RENT_ADDRESS, rentABI, provider)

  contract.on("RewardClaimed", async (address, amount, _) => {
    console.log("Claim Reward: ", `${address}, ${amount}`)

    await updateClaimReward(address, ethers.formatUnits(amount, 18))
    await updateUserRewardNonce(address)
  })

  gpuContract.on("Claimed", async (address, amount, _) => {
    console.log("Rent Claimed: ", `${address}, ${amount}`)

    await updateRentClaim(address, ethers.formatUnits(amount, 18))
    await updateUserRentNonce(address)
  })

  gpuContract.on("Refunded", async (address, amount, _) => {
    console.log("Rent Refunded: ", `${address}, ${amount}`)

    // await updateRentRefund(address, ethers.formatUnits(amount, 18))
    // await updateUserRentNonce(address)
  })
}
