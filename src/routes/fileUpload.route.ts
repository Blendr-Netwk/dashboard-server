import { Router } from "express"
import { authenticateJwt } from "@/middleware"
import { memoryStorage } from "@/services/multer"
import FileUploadController from "@/controller/fileUpload/fileUpload.controller"

const router = Router()
const fileUploadController: FileUploadController = new FileUploadController()

router.post(
  "/file-upload/upload",
  memoryStorage.single("file"),
  fileUploadController.upload
)
router.post(
  "/file-upload/signed-url",
  authenticateJwt,
  fileUploadController.signedURL
)

export { router as fileUpload }
