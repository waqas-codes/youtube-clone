import asyncHandler from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from '../utils/apiResponse.js'

const userRegisteration = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const { username, email, password, fullName } = req.body
    // console.log("username: ", username)

    if ([username, email, password, fullName].some((field) => field?.trim === "")) {
        throw new apiError(400, "All fields are required")
    }

    const existUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!existUser) {
        throw new apiError(409, "User with email and username is already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new apiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new apiError(500, "something went wrong while user registering")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully ")
    )
})

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { refreshToken, accessToken }
    } catch (error) {
        console.log(error)
        throw new apiError(500, "something went wrong while generating access and refresh tokens")
    }
}

const login = asyncHandler(async (req, res) => {
    // 1: check body -> data
    // 2: check email or username
    // 3: find user
    // 4: check password
    // 5: generate access and refresh token
    // 6: send cookie 

    const { username, email, password } = req.body

    // if(!email && !username) {
    //     throw new apiError(400, "email and username required")
    // }

    if (!(email || username)) {
        throw new apiError(400, "email and username required!")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new apiError(404, "user not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new apiError(401, "invalid credintial!")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged in successfully"
            )
        )

})

const logout = asyncHandler(async (req, res) => {
    const userId = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    console.log(userId)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new apiError(401, "unauthorized request")
    }

    const decodedToken = await jwt.verity(incomingRefreshToken, process.env.ACCESS_TOKEN_SECRET)

    const user = User.findById(decodedToken?._id)
    if (!user) {
        throw new apiError(401, "unauthorized request")
    }

    if (incomingRefreshToken !== user?.refreshToken) {
        throw new apiError(401, "invalid refresh token")
    }

    const options = {
        httpOnly: true,
        secure: true
    }
    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id)

    return res.
        status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(
                200,
                { refreshToken, accessToken },
                "token refreshed"
            )
        )
})

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new apiError(401, "old and new password field are required")
    }

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new apiError(400, "invalid old passowrd")
    }

    usre.password = password
    user.save({ validateBeforeSave: true })

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "passowrd changed successfully")
        )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "user fetched successfully")
        )
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { email, fullName } = req.body

    if (!email || !fullName) {
        throw new apiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                email,
                fullName
            }
        },
        {
            new: true
        }
    ).select("-passowrd")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "accoutn detail updated successfully")
        )
})

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new apiError(400, "avatar file is missing")
    }

    const avatar = uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new apiError(401, "error while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "avatar image updated successfully")
        )
})

const updateConverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new apiError(400, "cover image is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!coverImage.url) {
        throw new apiError(400, "error while uploading on cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.body?._id,
        {
            coverImage: coverImage.url
        },
        {
            new: true
        }
    ).select("-passowrd")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "cover image updated successfully")
        )
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params

    if (!username) {
        throw new apiError(400, "username does not exist!")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribedTo"
            }
        },
        {
            $addField: {
                subscriberCount: {
                    $size: "$subscribers"
                },
                channelSubscriberToCount: {
                    $size: "$subscribedTo"
                },
                isSubscriberd: {
                    $con: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                avatar: 1,
                email: 1,
                subscriberCount: 1,
                channelSubscriberToCount: 1,
                isSubscriberd: 1
            }
        }
    ])

    if (!channel?.length) {
        throw new apiError(400, "channel does not exist")
    }

    return res.
        status(200)
        .json(
            new ApiResponse(200, channel[0], "channel fetched successfully")
        )
})

const getWatchHistory = asyncHandler( async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    if (!user.length) {
        throw new apiError(404, "User does not exist");
    }

    return res.
    status(200)
    .json(
        new ApiResponse(200, user[0].watchHistory, "watch history fetched successfully")
    )
})

export {
    userRegisteration,
    login,
    logout,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateConverImage,
    getUserChannelProfile,
    getWatchHistory
} 