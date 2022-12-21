/// <reference types="express-serve-static-core" />
/// <reference types="multer" />
declare const uploadFile: (file: Express.Multer.File, folder: string) => Promise<string>;
declare const deleteFile: (url: string) => Promise<string>;
export { deleteFile, uploadFile, };
