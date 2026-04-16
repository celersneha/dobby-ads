import { Router } from "express";
import {
  deleteImage,
  deleteImageByName,
  getImagesByFolder,
  resolveImageByName,
  uploadImage,
} from "../controllers/image.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/upload").post(upload.single("file"), uploadImage);
router.route("/resolve/by-name").get(resolveImageByName);
router.route("/by-name").delete(deleteImageByName);
router.route("/:folderId").get(getImagesByFolder);
router.route("/:imageId").delete(deleteImage);

export default router;
