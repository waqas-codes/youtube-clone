import connectDB from "./configDB/db.js";
import dotenv from 'dotenv'
import express from 'express'
const PORT = process.env.PORT || 5000
const app = express()
dotenv.config({
    path: '../.env'
})

connectDB()

app.listen(PORT, () => {    
    console.log(`server is running on port ${process.env.PORT}`)
})

