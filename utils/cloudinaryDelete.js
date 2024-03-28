import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
})
const deleteFromCloudinary = async (userId)=> {
    try {
        if (!userId) return null
        const response = await cloudinary.uploader.destroy(userId, {
            resource_type: "auto"
        })
        console.log("File has been deleted successfullt!!!")
    } catch (error) {
        console.log("Error occurred while deleting the file!!! ",error)
    } 
}
export {deleteFromCloudinary}