import mongoose from 'mongoose'
import { DB_Name } from '../constant.js'

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.mongo_URL)
        // console.log("database connect: ",connectionInstance)
    } catch (error) {
        console.log("MONGODB connection FAILED: ", error)
        // exit(1)
    }
}

export default connectDB