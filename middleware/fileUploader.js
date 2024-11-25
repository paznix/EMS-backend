import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

// Create Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const fileExtension = file.originalname.split(".").pop().toLowerCase();

    // Define resource type based on file type
    let resourceType = "auto";
    const allowedImageTypes = ["jpg", "jpeg", "png", "gif", "bmp", "svg"];
    if (!allowedImageTypes.includes(fileExtension)) {
      resourceType = "raw"; // Non-image files
    }

    return {
      folder: "leaveDocuments",
      resource_type: resourceType, // Set the resource type dynamically
      format: fileExtension, // Maintain the original file format
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    };
  },
});

// Set up Multer middleware
const cloudinaryFileUploader = multer({ storage: storage });

export default cloudinaryFileUploader;
