import asyncHandler from '../utils/asyncHandler.js'
import { apiError } from '../utils/apiError.js'
import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'

const verifyToken = asyncHandler( async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("authorization")?.replace("Bearer", "")

        if(!token) {
            throw new apiError(401, "unAuthorized request")
        }
        
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if(!user) {
            throw new apiError(401, "invalid access token")
        }

        user.req = user
        next()

    } catch (error) {
        throw new apiError(401, "invalid access token")
    }
})

export default verifyToken
