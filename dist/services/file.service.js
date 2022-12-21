"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = exports.deleteFile = void 0;
const AWS = require("aws-sdk");
const crypto = require("crypto");
const initStorage = () => {
    const spacesEndpoint = new AWS.Endpoint(process.env.digitalOceanConfigSpacesEndpoint);
    return new AWS.S3({
        endpoint: spacesEndpoint,
        accessKeyId: process.env.digitalOceanConfigKey,
        secretAccessKey: process.env.digitalOceanConfigSecret,
    });
};
const uploadFile = async (file, folder) => {
    const { filenameWithPath } = await uploadFileToS3(file, folder);
    const url = `https://${process.env.digitalOceanConfigBucket}.${process.env.digitalOceanConfigSpacesEndpoint}/${filenameWithPath}`;
    return url;
};
exports.uploadFile = uploadFile;
const deleteFile = async (url) => {
    const filePath = url.replace(process.env.digitalOceanConfigSpacesEndpoint, '');
    await initStorage().deleteObject({
        Key: filePath,
        Bucket: process.env.digitalOceanConfigBucket,
    }).promise();
    return 'OK';
};
exports.deleteFile = deleteFile;
const uploadFileToS3 = async (file, folder) => {
    console.log(process.env.digitalOceanConfigSpacesEndpoint);
    const ext = file.originalname.split('.');
    const rand = crypto.randomBytes(3).toString('hex');
    const filename = `${rand}${Date.now()}.${ext[ext.length - 1]}`;
    const KEY = `${process.env.digitalOceanConfigRootFolder}/${folder ? `${folder}/` : 'doc/'}${filename}`;
    // const contentType = mime.lookup(file.originalname) || 'application/octet-stream';
    const contentType = 'application/octet-stream';
    const spacesEndpoint = new AWS.Endpoint(process.env.digitalOceanConfigSpacesEndpoint);
    const s3 = new AWS.S3({
        endpoint: spacesEndpoint,
        accessKeyId: process.env.digitalOceanConfigKey,
        secretAccessKey: process.env.digitalOceanConfigSecret,
    });
    await s3.upload({
        Bucket: process.env.digitalOceanConfigBucket,
        Key: KEY,
        Body: file.buffer,
        ContentType: contentType,
        ACL: 'public-read',
    }).promise();
    return {
        filename,
        filenameWithPath: KEY,
        mimetype: contentType,
    };
};
//# sourceMappingURL=file.service.js.map