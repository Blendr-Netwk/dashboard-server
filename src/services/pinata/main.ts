import { PinataSDK, UploadOptions } from "pinata"
import { generateRandomString } from "@/utils"

const pinataJwt = process.env.PINATA_JWT
const pinataGateway = process.env.PINATA_GATEWAY
const pinataGroupId = process.env.PINATA_GROUP_ID

const pinata = new PinataSDK({
  pinataJwt,
  pinataGateway,
})

export const uploadFile = async (file: Express.Multer.File) => {
  try {
    const name = file.originalname
    const type = file.mimetype

    const options: UploadOptions = {
      groupId: pinataGroupId,
    }

    const multerText = Buffer.from(file.buffer).toString("utf-8")
    const f = new File([multerText], `${generateRandomString(10)}_${name}`, {
      type,
    })

    const upload = await pinata.upload.file(f, options)
    console.log("upload:", upload)
    return upload
  } catch (error) {
    console.error("Error upload file:", error)
    return undefined
  }
}

export const createSignedURL = async (cid: string) => {
  try {
    const url = await pinata.gateways.createSignedURL({
      cid,
      expires: 3600,
    })
    return url
  } catch (error) {
    console.error("Error createSignedURL:", error)
    return undefined
  }
}
