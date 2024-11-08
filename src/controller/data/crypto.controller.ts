import { updatePricePair } from "@/services/prisma/price-pair/main"
import { NextFunction, Request, Response } from "express"

class CryptoDataController {
  public async fetchRates(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await updatePricePair()

      res.status(200).json(response)
    } catch (error) {
      next(error)
    }
  }
}

export default CryptoDataController
