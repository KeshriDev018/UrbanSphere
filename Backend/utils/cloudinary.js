import { v2 as cloudinary } from "cloudinary";

 

// Upload file buffer to Cloudinary
const uploadBufferToCloudinary = async (fileBuffer, folder = "society-app") => {
  try {
    
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });


    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: "auto",
          },
          (error, uploadResult) => {
            if (error) reject(error);
            else resolve(uploadResult);
          }
        )
        .end(fileBuffer);
    });

    return result;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return null;
  }
};

export default uploadBufferToCloudinary;
