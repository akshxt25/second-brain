import mongoose, { mongo } from "mongoose";

const MONGO_URL = process.env.MONGO_URL as string;
async function connectDB(){
    const result = await mongoose.connect(MONGO_URL);
}

export default connectDB;