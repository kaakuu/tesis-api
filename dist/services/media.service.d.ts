/// <reference types="express-serve-static-core" />
/// <reference types="multer" />
declare const createFile: (file: Express.Multer.File, name?: string) => Promise<import("../models/media-types").IMediaDocument>;
declare const getFiles: (req: any, res: any) => Promise<any>;
export { createFile, getFiles, };
