import { ethers } from "ethers"
import { RPC_HTTP_URL } from "../../constant"

export const getEtherProvider = () => {
  return new ethers.JsonRpcProvider(RPC_HTTP_URL)
}
