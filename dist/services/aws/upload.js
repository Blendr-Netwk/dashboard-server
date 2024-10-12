"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImageFromUrl = void 0;
const main_1 = require("./main");
const utils_1 = require("@/utils");
const uploadImageFromUrl = async (url, userId) => {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('Content-Type');
    if (!contentType)
        throw new Error('no content type found');
    const fileExtension = contentType.split('/')[1] || 'jpg'; // Default to jpg if not found
    const params = {
        Bucket: (0, main_1.getBucketName)(),
        Key: `generatedImages/${userId}/${(0, utils_1.generateRandomString)(10)}.${fileExtension}`,
        Body: buffer,
        ContentType: contentType,
    };
    const res = await main_1.awsS3.upload(params).promise();
    console.log(res);
    return res;
};
exports.uploadImageFromUrl = uploadImageFromUrl;
