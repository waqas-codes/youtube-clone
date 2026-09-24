import fs from 'fs'
import {v2 as cloudinary} from 'cloudinary'
import { fileURLToPath } from 'url';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null

        const response = await cloudinary.uploader.upload(fileURLToPath, {
            resource_type: "auto"
        })

        console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(fileURLToPath)
        return response
    } catch (error) {
        fs.unlinkSync(fileURLToPath)
        return null
    }
}