"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWTToken = exports.generateAuthToken = void 0;
const config_1 = require("@/config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateAuthToken = (userId, publicAddress) => {
    return jsonwebtoken_1.default.sign({ userId, publicAddress }, config_1.JWT_SECRET, { expiresIn: config_1.JWT_EXPIRATION });
};
exports.generateAuthToken = generateAuthToken;
const verifyJWTToken = async (token) => {
    return await jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
};
exports.verifyJWTToken = verifyJWTToken;
