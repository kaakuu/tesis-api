import { model } from "mongoose";
import { IMediaDocument } from "./media-types";
import MediaSchema from "./media.schema";
export const MediaModel = model<IMediaDocument>("media", MediaSchema);