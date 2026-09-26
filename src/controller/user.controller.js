import asyncHandler from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import {clou}

const userRegisteration = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {username, email, password, fullName } = req.body
    // console.log("username: ", username)

    if([username, email, password, fullName].some((field) => field?.trim === "")){
        throw new apiError(400, "All fields are required")        
    }

    const existUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(existUser) {
        throw new apiError(409, "User with email and username is already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImage = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath) {
        throw new apiError(400, "Avatar file is required")
    }



})

export default userRegisteration