import { Schema } from "mongoose";
const MediaSchema = new Schema({
  url: String,
  name: String
});
export default MediaSchema;