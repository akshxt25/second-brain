import mongoose , {model, Schema} from "mongoose";

const contentSchema = new Schema({
  link: String,
  title: String,
  notes: { type: String, default: "" },
  contentType: {type: String, required: true},
  tags: [{type: String, required: true}],
  owner: {type: mongoose.Types.ObjectId, ref:'User', required: true},
  embedding: { type: [Number], default: [] }
})

export const ContentModel = model("ContentSchema", contentSchema)