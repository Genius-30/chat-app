import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //Upload file
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
    });

    fs.unlinkSync(localFilePath);

    return uploadResult;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.error("Error occurred while uploading file on Cloudinary: ", error);
    return null;
  }
};

const deleteFromCloudinary = async (url) => {
  try {
    const publicId = url.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    console.error(
      "Error occurred while deleting file from Cloudinary: ",
      error
    );
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
