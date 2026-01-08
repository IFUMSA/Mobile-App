import { v2 as cloudinary } from "cloudinary";
import config from "../config";

// Debug: Check if credentials are loading
console.log("Cloudinary config check:", {
    cloud_name: config.CLOUDINARY_CLOUD_NAME ? "SET" : "NOT SET",
    api_key: config.CLOUDINARY_API_KEY ? "SET" : "NOT SET",
    api_secret: config.CLOUDINARY_API_SECRET ? "SET" : "NOT SET",
});

// Configure Cloudinary
cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
    url: string;
    publicId: string;
    width: number;
    height: number;
}

/**
 * Upload an image to Cloudinary from base64 data
 * Uses unsigned upload with preset for simplicity
 */
export const uploadImage = async (
    base64Data: string,
    folder: string = "ifumsa"
): Promise<UploadResult> => {
    try {
        console.log("Attempting Cloudinary upload...");
        console.log("Cloud name:", config.CLOUDINARY_CLOUD_NAME);

        const result = await cloudinary.uploader.upload(base64Data, {
            folder,
            resource_type: "image",
            // Use unsigned upload preset if you've created one
            // upload_preset: "ifumsa_unsigned",
        });

        console.log("Upload successful:", result.public_id);

        return {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
        };
    } catch (error: any) {
        console.error("Cloudinary upload failed:");
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        if (error.error) {
            console.error("Error details:", error.error);
        }
        throw error;
    }
};

/**
 * Delete an image from Cloudinary
 */
export const deleteImage = async (publicId: string): Promise<void> => {
    await cloudinary.uploader.destroy(publicId);
};

export default cloudinary;
