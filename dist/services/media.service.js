"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFiles = exports.createFile = void 0;
const media_model_1 = require("../models/media.model");
const file_service_1 = require("./file.service");
const createFile = async (file, name) => {
    try {
        const url = await (0, file_service_1.uploadFile)(file, '');
        const media = await media_model_1.MediaModel.create({
            url,
            name
        });
        return media;
    }
    catch (err) {
        console.log(err);
    }
};
exports.createFile = createFile;
const getFiles = async (req, res) => {
    const files = await media_model_1.MediaModel.find({});
    return res.status(200).send(files);
};
exports.getFiles = getFiles;
//# sourceMappingURL=media.service.js.map