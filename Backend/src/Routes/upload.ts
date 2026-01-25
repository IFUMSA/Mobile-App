import express, { type Router } from "express";
import { uploadImageController, deleteImageController } from "../Controllers/uploadController";
import { requireAuth } from "../Middlewares/requireAuth";

const uploadRouter: Router = express.Router();

// Upload image (base64)
uploadRouter.post("/image", requireAuth, uploadImageController);

// Delete image
uploadRouter.delete("/image", requireAuth, deleteImageController);

export = uploadRouter;
