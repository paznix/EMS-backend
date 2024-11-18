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
  params: {
    folder: "uploads",
    format: async (req, file) => {
      const fileExtension = file.originalname.split(".").pop().toLowerCase();
      if (fileExtension === "jpg" || fileExtension === "jpeg" || fileExtension === "png") {
        return fileExtension;
      } else {
        return "jpg";
      }
    },
    public_id: (req, file) => file.originalname.split(".")[0] + "",
    transformation: [
      {
        width: 1200,
        height: 1200,
        crop: "crop",  
        gravity: "auto" 
      }
    ]
  },
});

// Set up Multer middleware
const cloudinaryFileUploader = multer({ storage: storage });

export default cloudinaryFileUploader;
