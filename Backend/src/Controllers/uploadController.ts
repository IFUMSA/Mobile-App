import { Request, Response } from "express";
import { uploadImage, deleteImage } from "../Services/cloudinary";

/**
 * Upload an image to Cloudinary
 * Accepts base64 image data in the request body
 */
export const uploadImageController = async (req: Request, res: Response) => {
    try {
        const { image, folder } = req.body;

        if (!image) {
            res.status(400).json({
                success: false,
                error: "Image data is required",
            });
            return;
        }

        // Validate base64 format
        if (!image.startsWith("data:image/")) {
            res.status(400).json({
                success: false,
                error: "Invalid image format. Must be base64 data URL",
            });
            return;
        }

        const result = await uploadImage(image, folder || "ifumsa");

        res.json({
            success: true,
            url: result.url,
            publicId: result.publicId,
        });
    } catch (error: unknown) {
        console.error("Image upload error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to upload image",
        });
    }
};

/**
 * Delete an image from Cloudinary
 */
export const deleteImageController = async (req: Request, res: Response) => {
    try {
        const { publicId } = req.body;

        if (!publicId) {
            res.status(400).json({
                success: false,
                error: "Public ID is required",
            });
            return;
        }

        await deleteImage(publicId);

        res.json({
            success: true,
            message: "Image deleted successfully",
        });
    } catch (error: unknown) {
        console.error("Image delete error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to delete image",
        });
    }
};
