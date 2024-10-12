"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBucketName = exports.awsPricing = exports.awsEC2 = exports.awsS3 = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
aws_sdk_1.default.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    region: process.env.AWS_REGION,
});
exports.awsS3 = new aws_sdk_1.default.S3();
exports.awsEC2 = new aws_sdk_1.default.EC2();
exports.awsPricing = new aws_sdk_1.default.Pricing();
const getBucketName = () => {
    let bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) {
        bucketName = "blendrai";
    }
    return bucketName;
};
exports.getBucketName = getBucketName;
