import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async(request, _, next)=> {
    try {
        const token = request.cookies?.accessToken || requestAnimationFrame.heaader("Authorization")?.replace("Bearer", "")
        next()
    }
    catch (error) {
        throw new ApiError(401,error?.message||"Invalid acess token")
    }
})