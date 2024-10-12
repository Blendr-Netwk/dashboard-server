"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImages = exports.saveImage = void 0;
const main_1 = require("../main");
const saveImage = async (userId, image) => {
    const savedImage = await main_1.prisma.image.create({
        data: {
            url: image.url,
            type: image.type,
            prompt: image.prompt,
            model: image.model,
            size: image.size,
            quality: image.quality,
            userId: userId,
        },
    });
    return savedImage;
};
exports.saveImage = saveImage;
const getImages = async () => {
    const images = await main_1.prisma.image.findMany({
        take: 10,
        orderBy: {
            createdAt: 'desc'
        }
    });
    return images;
};
exports.getImages = getImages;
