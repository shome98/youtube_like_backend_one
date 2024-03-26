import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinaryUpload.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const registerUser = asyncHandler(async (request, response) => {
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
const generateAccessTokenAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId) 
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken
        await user.save({ valiDateBefore: false })
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong while genearting refresh and access token!!!")
    }

}
const getCurrentUser = asyncHandler(async (request, response) => {
    return response
        .status(200)
        .json(new ApiResponse(
            200,
            request.user,
            "Got user details succuessfully"
        ))
})
const loginUser = asyncHandler(async (request, response) => {
    //get user data
    const { username, email,password } = await request.body
    console.log(`${email}--${username}`)
    //validate means check username or email available or not
    if (!username && !email) {
        throw new ApiError(400,"username or email is mandatory!!!")
    }
    //find the user
    const user = await User.findOne({
        $or:[{username},{email}]
    })
    if (!user) {
        throw new ApiError(404,"User does not exist!!!")
    }
    //password check
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (isPasswordValid==="false") {
        throw new ApiError(401,"Invalid user credentials")
    }
    //access and refresh token generate
    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshTokens(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const options = {
        httpOnly: true,
        secure: true
    }
    //send cookie
    return response
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user:loggedInUser,accessToken,refreshToken
                },
                "User logged in"
        )
    )
})
export {
    registerUser,
    getCurrentUser,
    loginUser
}
