import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";

/**
 * Upload a buffer (from multer memory storage) to Cloudinary.
 * Returns { url, publicId }
 */
export const uploadImage = (buffer, folder = "shopsphere/products") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image", quality: "auto", fetch_format: "auto" },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    // Convert buffer to readable stream and pipe into Cloudinary
    Readable.from(buffer).pipe(uploadStream);
  });
};

/**
 * Delete an image from Cloudinary by its public_id.
 */
export const deleteImage = async (publicId) => {
  await cloudinary.uploader.destroy(publicId);
};
