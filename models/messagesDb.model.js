import mongoose from "mongoose";

const Schema = mongoose.Schema;

const messagesSchema = new Schema(
  {
    message: String,
    name: String,
    timestamp: String,
    received: Boolean,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("messagecontents", messagesSchema);
