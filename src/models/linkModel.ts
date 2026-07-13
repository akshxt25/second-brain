import mongoose , {model, Schema} from "mongoose";

const linkSchema = new Schema({
  hash: String,
  userId: {type: mongoose.Types.ObjectId, ref:'User', required: true, unique: true}
})

export const LinkModel = model("LinkSchema", linkSchema)