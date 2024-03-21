import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index:true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    //add phone number
    // phoneNumber: {
    //     type: Number,
    //     required: true,
    //     trim:true
    // },
    avatar: {
        type: String,//url from cloudinary
        required: true
    },
    coverImage: {
        type: String,//url from cloudinary
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password: {
        type: String,
        required: [true,`please provide a password to continue`]
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true })
export const User=mongoose.model("User",userSchema)