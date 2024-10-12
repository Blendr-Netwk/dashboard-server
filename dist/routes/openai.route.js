"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openai = void 0;
const openai_controller_1 = __importDefault(require("@/controller/ai/openai.controller"));
const middleware_1 = require("@/middleware");
const multer_1 = require("@/services/multer");
const express_1 = require("express");
const router = (0, express_1.Router)();
exports.openai = router;
const openAiController = new openai_controller_1.default();
router.post('/generate/text-to-image', middleware_1.authenticateJwt, openAiController.generateTextToImage);
// router.post('/edit/text-to-image', authenticateJwt, multerUpload.fields([{ name: 'image', maxCount: 1 }, { name: 'mask', maxCount: 1 }]), openAiController.editTextToImage);
router.post('/generate/variation', middleware_1.authenticateJwt, multer_1.multerUpload.single("image"), openAiController.generateVariation);
router.get('/generated/images', openAiController.getAllImages);
