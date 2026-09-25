import express from 'express'
import userRegisteration from '../controller/user.controller.js'
const router = express.Router()


router.get("/register", userRegisteration)

export default router