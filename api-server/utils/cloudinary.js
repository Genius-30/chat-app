import { v2 as cloudinary } from "cloudinary";
import { configDotenv } from "dotenv";
configDotenv();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload any type of file to Cloudinary
const uploadOnCloudinary = async (fileBuffer) => {
  try {
    // Use resource_type 'auto' to handle various file types
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" }, // Auto-detect the type of resource (image, video, raw, etc.)
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      stream.end(fileBuffer); // Send the file buffer to Cloudinary
    });

    return uploadResult;
  } catch (error) {
    console.error("Error occurred while uploading file on Cloudinary: ", error);
    return null;
  }
};

const deleteFromCloudinary = async (url) => {
  try {
    const publicId = url.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(publicId, { resource_type: "auto" });
  } catch (error) {
    console.error(
      "Error occurred while deleting file from Cloudinary: ",
      error
    );
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
