"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const image_1 = require("@/services/prisma/image");
const openai_1 = require("@/services/openai");
const upload_1 = require("@/services/aws/upload");
class OpenAIController {
    async generateTextToImage(req, res, next) {
        try {
            const { prompt, size, quality } = req.body;
            const response = await (0, openai_1.generateImage)(prompt, size, quality);
            if (!response.url)
                throw new Error('no url generated');
            const storedImg = await (0, upload_1.uploadImageFromUrl)(response.url, req.user.id);
            await (0, image_1.saveImage)(req.user.id, {
                url: storedImg.Location,
                type: "generate",
                prompt: prompt,
                model: 'dall-e-3',
                size: size,
                quality: quality,
            });
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async generateVariation(req, res, next) {
        try {
            const { size } = req.body;
            const imgUrl = await (0, openai_1.openaiCreateVariation)(req.file, size);
            const storedImg = await (0, upload_1.uploadImageFromUrl)(imgUrl, req.user.id);
            await (0, image_1.saveImage)(req.user.id, {
                url: storedImg.Location,
                type: "variation",
                prompt: "",
                model: 'dall-e-3',
                size: size,
                quality: 'standard',
            });
            res.status(200).json(storedImg.Location);
        }
        catch (error) {
            next(error);
        }
    }
    async getAllImages(req, res, next) {
        try {
            const images = await (0, image_1.getImages)();
            res.status(200).json(images);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = OpenAIController;
