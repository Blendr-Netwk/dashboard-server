import { NextFunction, Request, Response } from "express"
import {
  uploadFile,
  createSignedURL,
} from "@/services/pinata/main"

class FileUploadController {
  public async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file
      if (!file) throw new Error("file is required")

      const response = await uploadFile(file)
      if (!response) throw new Error("Error uploading file to Pinata")

      return res.status(200).send({
        sucess: "Upload successfully",
        data: {
          cid: response.cid,
        },
      })
    } catch (err) {
      next(err)
      return
    }
  }

  public async signedURL(req: Request, res: Response, next: NextFunction) {
    try {
      const { cid } = req.body

      if (!cid) throw new Error("cid is required")

      const signedURL = await createSignedURL(cid)

      return res.status(200).send({
        sucess: "Create Signed URL successfully",
        data: signedURL,
      })
    } catch (err) {
      next(err)
      return
    }
  }
}
export default FileUploadController
