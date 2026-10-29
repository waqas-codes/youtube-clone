import express from 'express'
import { upload } from '../middleware/file.middleware.js'
import verifyToken from '../middleware/auth.middleware.js'
import {
     getAllVideos,
    getVideoById,
    updateVideo,
    deleteVidoe,
    publishVideo,
    togglePublishStatus
} from '../controller/video.controller.js'
const router = express.Router()
router.use(verifyToken) // Apply verifyJWT middleware to all routes in this file

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

router.get("/", getAllVideos)
router.post('/publish', fileUpload, publishVideo)
router.get('/:videoId', getVideoById)
router.delete('/:videoId', deleteVidoe)
router.patch('/:videoId', upload.single("thumbnail"), updateVideo)
router.patch("/toggle/publish/:videoId", togglePublishStatus)

export default router