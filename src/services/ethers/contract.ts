import { RENT_ADDRESS } from "@/constant/web3"
import rentABI from "@/data/abi/rent.json"
import { ethers } from "ethers"
import { getEtherProvider } from "./main"

export const getRentContract = async () => {
  const provider = getEtherProvider()
  return new ethers.Contract(RENT_ADDRESS, rentABI, provider)
}
