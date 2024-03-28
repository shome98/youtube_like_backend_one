import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinaryUpload.js"
import { deleteFromCloudinary } from "../utils/cloudinaryDelete.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";
import mongoose from "mongoose";



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
        await user.save({ valiDateBeforeSave: false })
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
const logoutUser = asyncHandler(async (request, response) => {
    await User.findByIdAndUpdate(
        request.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new:true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return response
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
    .json(new ApiResponse(200,{},"User just logged out!!!"))
})
const refreshAcessToken = asyncHandler(async (request, response) => {
    const incomingRefreshToken = request.cookies.refreshToken || request.body.refreshToken
    if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized request!!!")
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)
        if (!user) throw new ApiError(401,"Invalid refresh token!!!")
        if (incomingRefreshToken !== user?.refreshToken) throw new ApiError(401, "Refresh token is expired or user!!!")
        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, newRefreshToken } = await generateAccessTokenAndRefreshTokens(user._id)
        return response
            .status(200)
            .cookie("acceessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Acess token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message||"Invalid refresh token")
    }
    
})
const changeCurrentPassword = asyncHandler(async (request, response) => {
    const { oldPassword, newPassword } = request.body
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (isPasswordCorrect === "false") throw new ApiError(400, "Enter the correct current password")
    user.password = newPassword
    await user.save({ valiDateBeforeSave: false })
    return response
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
})
const updateAccountDetails = asyncHandler(async (request, response) => {
    const { fullName, email } = request.body
    if (!fullName || !email) throw new ApiError(400, "All fields are required")
    const user = await User.findByIdAndUpdate(
        request.user?._id,
        {
            $set: {
                fullName,
                email: email    
            }
        },
        { new: true }
    ).select("-password")
    return response
        .status(200)
    .json(new ApiResponse(200,user,"Account details updated successfully"))
})
const updateUserAvatar = asyncHandler(async (request, response) => {
    const avatarLocalPath = request.file?.path
    if (!avatarLocalPath) throw new ApiError(400, "Avatar file is missing!!!")
    //delete old avatar
    //we can just set previous avatar url to null to remove it from db
    const currentUser=await User.findById(request.user?._id)
    if (currentUser.avatar) {
        const userId = currentUser.avatar.split('/').pop().split('.')[0]
        await deleteFromCloudinary(userId)
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.url) throw new ApiError(400, "Error occurred while uploading the avatar!!!")
    const user = await User.findByIdAndUpdate(
        request.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")
    return response
        .status(200)
    .json(new ApiResponse(200,user,"Avatar image successfully updated"))
})
const updateCoverImage = asyncHandler(async (request, response) => {
    const coverImageLocalPath = request.file?.path
    if (!coverImageLocalPath) throw new ApiError(400, "Cover image file is missing!!!")
    const currentUser=await User.findById(request.user?._id)
    if (currentUser.coverImage) {
        const userId = currentUser.coverImage.split('/').pop().split('.')[0]
        await deleteFromCloudinary(userId)
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!coverImage.url) throw new ApiError(400, "Error occurred while uploading the cover image")
    const user = await User.findByIdAndUpdate(
        request.user?._id,
        {
            $set: {
                coverImage:coverImage.url
            }
        },
        { new: true }
    ).select("-password")
    return response
        .status(200)
        .json(new ApiResponse(200, user, "Cover image updated successfully"))
})


export {
    registerUser,
    getCurrentUser,
    loginUser,
    logoutUser,
    refreshAcessToken,
    changeCurrentPassword,
    updateAccountDetails,
    updateUserAvatar,
    updateCoverImage
}
