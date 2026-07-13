import mongoose , {model, mongo, Schema} from "mongoose";

const contentSchema = new Schema({
  link: String,
  title: String,
  tags: [{type: String, required: true}],
  owner: {type: mongoose.Types.ObjectId, ref:'User', required: true}
})

export const ContentModel = model("ContentSchema", contentSchema)