import express from 'express'
import userRegisteration from '../controller/user.controller.js'
import {upload} from '../middleware/file.middleware.js'
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

export default router