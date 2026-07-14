import mongoose from "mongoose";

async function connectDB() {
    console.log("Inside connectDB:", process.env.MONGO_URL);

    if (!process.env.MONGO_URL) {
        throw new Error("MONGO_URL not found");
    }

    await mongoose.connect(process.env.MONGO_URL);
}

export default connectDB;