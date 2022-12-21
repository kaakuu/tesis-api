import { MediaModel } from "../models/media.model";
import { uploadFile } from "./file.service";

  const createFile = async (file: Express.Multer.File, name?: string) => {

    try {
      const url = await uploadFile(file, '');

      const media = await MediaModel.create({
        url,
        name
      });

      return media;
    } catch (err) {
      console.log(err);
    }
  }

  const getFiles = async( req: any, res : any ) => {
    const files = await MediaModel.find({});
    return res.status(200).send(files);
  }

  export {
    createFile,
    getFiles,
};
