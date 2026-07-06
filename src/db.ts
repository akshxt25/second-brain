import mongoose, { mongo } from "mongoose";
import { model, Schema } from "mongoose";

const UserSchema = new Schema({
    username: {type: String, unique: true},
    password: {type: String}
})

export const UserModel = model("User", UserSchema);



const ContentSchema = new Schema({
    link: String,
    title: String,
    tags: [{type: mongoose.Types.ObjectId, ref: 'Tag'}],
    owner: {type: mongoose.Types.ObjectId, ref: 'User', required: true}
})

export const ContentModel = model("Content", ContentSchema)


const LinkSchema = new Schema({
    hash: String,
    userId: {type: mongoose.Types.ObjectId, ref:'User', required: true, unique: true}
})

export const LinkModel = model("Link", LinkSchema);



async function connectDB(){
    const result = await mongoose.connect("mongodb+srv://akshat:akshat123@cluster0.4eqkxlm.mongodb.net/second-brain");
}

export default connectDB;