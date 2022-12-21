import { Document, Model } from "mongoose";
export interface IMedia {
  url: string;
}
export interface IMediaDocument extends IMedia, Document {}
export interface IMediaModel extends Model<IMediaDocument> {}