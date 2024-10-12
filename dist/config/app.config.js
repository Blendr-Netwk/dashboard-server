"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET = exports.logDirPath = exports.corsOptions = exports.IN_PROD = exports.NODE_ENV = exports.PORT = void 0;
exports.PORT = process.env.PORT || "8080";
exports.NODE_ENV = process.env.NODE_ENV || "development";
exports.IN_PROD = exports.NODE_ENV === "production";
const allowedOrigins = [
    "*",
];
exports.corsOptions = {
    origin: "*",
};
exports.logDirPath = process.env.LOG_DIR || 'logs';
exports.JWT_SECRET = "oh man i didnt have thios gug sa d?";
