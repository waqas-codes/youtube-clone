import express from 'express'
import {userRegisteration,
    login, 
    logout, 
    refreshAccessToken, 
    changePassword,
    updateAccountDetails,
    getCurrentUser,
    updateAvatar,
    updateConverImage,
    getUserChannelProfile,
    getWatchHistory
    } from '../controller/user.controller.js'
import {upload} from '../middleware/file.middleware.js'
import verifyToken from '../middleware/auth.middleware.js'
const router = express.Router()

const fileUpload = upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
])

router.post("/register",fileUpload, userRegisteration)
router.post("/login", login)

// secure routes
router.post('/logout', verifyToken, logout)
router.post("refresh-token", refreshAccessToken)
router.post("/change-password", verifyToken, changePassword)
router.patch("/update-account", verifyToken, updateAccountDetails)
router.get("/current-user", verifyToken, getCurrentUser)

router.patch("/avatar", verifyToken, updateAvatar)
router.patch("/cover-image", verifyToken, updateConverImage)

router.get("/c/:username", verifyToken, getUserChannelProfile)
router.get("/history", verifyToken, getWatchHistory)

export default router