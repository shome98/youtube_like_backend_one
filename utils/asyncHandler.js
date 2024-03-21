import { request } from "express"

const asyncHandler = (requestHandler) => {
    return (request, response, next) => Promise
                                            .resolve(requestHandler(request, response, next)
                                            .catch(error=>next(error)))
}
// const asyncHandler = (fn) => async (request, response, next) => {
//     try {
//         await fn(request,response,next)
//     }
//     catch (error) {
//         response.status(error.code || 500).json({
//             success: false,
//             message:error.message
//         })
//     }
// }
export {asyncHandler}