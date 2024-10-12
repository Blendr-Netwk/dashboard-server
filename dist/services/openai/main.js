"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openaiCreateVariation = exports.generateImage = void 0;
const openai_1 = __importDefault(require("openai"));
const fs_1 = __importDefault(require("fs"));
// import sharp from 'sharp';
const openai = new openai_1.default();
const generateImage = async (prompt, size, quality) => {
    const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: size,
        quality: quality
    });
    return response.data[0];
};
exports.generateImage = generateImage;
const openaiCreateVariation = async (image, size) => {
    if (!image)
        throw new Error('no image provided');
    const tempPath = (image.path).split('.').slice(0, -1).join('.') + '-temp.png';
    // await sharp(image.path).png().toFile(tempPath);
    const response = await openai.images.createVariation({
        image: fs_1.default.createReadStream(tempPath),
        // model: "dall-e-3",
        size: size
    });
    if (!response.data[0].url) {
        throw new Error('no url generated');
    }
    // After processing, delete the original uploaded file
    fs_1.default.unlink(image.path, (err) => {
        if (err) {
            console.error(`Failed to delete the original file: ${image.path}`, err);
        }
        else {
        }
    });
    // If you have a temporary file that needs deletion, similarly:
    // Replace 'tempFilePath' with your temporary file path variable
    fs_1.default.unlink(tempPath, (err) => {
        if (err) {
            console.error(`Failed to delete the temporary file: ${tempPath}`, err);
        }
        else {
        }
    });
    return response.data[0].url;
};
exports.openaiCreateVariation = openaiCreateVariation;
