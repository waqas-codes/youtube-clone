import express from 'express'
import { upload } from '../middleware/file.middleware.js'
import {
     getAllVideos,
    getVideoById,
    updateVideo,
    deleteVidoe,
    publishVideo,
    togglePublishStatus
} from '../controller/video.controller.js'
const router = express.Router()

const fileUpload = upload.fields([
    {
        name: "videoFile",
        maxCount: 1
    },
    {
        name: "thumbnail",
        maxCount: 1
    }
])

router.post('/publish', fileUpload, publishVideo)

export default router