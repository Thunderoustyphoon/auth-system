import mongoose from "mongoose";
import {DB_NAME} from "../constants/index.js"

const connectDB = async()=>{
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    console.log(`\n MongoDB connected! Host: ${connectionInstance.connection.host}`)
}
export default connectDB 