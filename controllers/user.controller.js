import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (request, response) => {
    response.status(200).json({
        message:"User registered"
    })
})
export { registerUser }
