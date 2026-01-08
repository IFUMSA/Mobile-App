import express, { type Router } from "express";
import { uploadImageController, deleteImageController } from "../Controllers/uploadController";

const uploadRouter: Router = express.Router();

// Upload image (base64)
uploadRouter.post("/image", uploadImageController);

// Delete image
uploadRouter.delete("/image", deleteImageController);

export = uploadRouter;
