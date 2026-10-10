import express from 'express'
import {userRegisteration, login, logout} from '../controller/user.controller.js'
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

export default router