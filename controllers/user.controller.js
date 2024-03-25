import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinaryUpload.js"
import {ApiResponse} from "../utils/ApiResponse.js"


const registerUser = asyncHandler(async (request, response) => {
    // response.status(200).json({
    //     message:"User registered"
    // })
    //get user details from forntend
    //validation-not empty
    //check if user already exists like username and email
    //check for images check for avatar image
    //upload the images to cloudinary
    //create user object and create and entry in database
    //remove password and refresh token fieild from response while creating database entry
    //check for creation is done or not
    //return yes

    //get user data
    const { fullName, email, username, password } = request.body
    console.log("email is: ", email,fullName,username,password)
    
    //check all required fields are present or not
    if ([fullName, email, username, password].some(field => field?.trim() === "")) {
        throw new ApiError(400,"All fields are required")
    }
   

    //check user exist or not
    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })
    if (existedUser) {
        throw new ApiError(409, "User with the same email or username already exists")
    }

    //check for images and avatar image
    //console.log(request.files)
    const avatarLocalPath = request.files?.avatar[0]?.path;
    //const coverImageLocalPath = request.files?.coverImage[0]?.path;
    let coverImageLocalPath
    if (request.files && Array.isArray(request.files.coverImage) && request.files.coverImage.length > 0) {
        coverImageLocalPath = request.files.coverImage[0].path
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)
    if (!avatar) {
        throw new ApiError(400,"Avatar file is mandatory")
    }

    //create user object and create database entry 
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })
    

    //remove password and refresh token from database entry
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    
    //check creation is done or not
    if (!createdUser) {
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    //return yes if user is successfully created
    return response.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )
})
export { registerUser }
