import * as AWS from 'aws-sdk';
import * as crypto from 'crypto';

  const initStorage = () => {
    const spacesEndpoint = new AWS.Endpoint(process.env.digitalOceanConfigSpacesEndpoint);
    return new AWS.S3({
      endpoint: spacesEndpoint,
      accessKeyId: process.env.digitalOceanConfigKey,
      secretAccessKey: process.env.digitalOceanConfigSecret,
    });
  }

  const uploadFile = async(file: Express.Multer.File, folder: string) => {
    const { filenameWithPath } = await uploadFileToS3(file, folder);
    const url = `https://${process.env.digitalOceanConfigBucket}.${process.env.digitalOceanConfigSpacesEndpoint}/${filenameWithPath}`;
    return url;
  }

  const deleteFile = async (url: string) => {

    const filePath = url.replace(process.env.digitalOceanConfigSpacesEndpoint, '');
    await initStorage().deleteObject({
      Key: filePath,
      Bucket: process.env.digitalOceanConfigBucket,
    }).promise();
    return 'OK';
  }

  const uploadFileToS3 = async(file: Express.Multer.File, folder: string) => {
    console.log(process.env.digitalOceanConfigSpacesEndpoint)
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
  }

  export {
    deleteFile,
    uploadFile,
};
