"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
const express_1 = require("express");
const crypto_controller_1 = __importDefault(require("@/controller/data/crypto.controller"));
const router = (0, express_1.Router)();
exports.data = router;
const cryptoDataController = new crypto_controller_1.default();
router.get('/crypto-pairs', cryptoDataController.fetchRates);
