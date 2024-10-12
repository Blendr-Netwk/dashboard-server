"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
function errorHandler(err, req, res, next) {
    const status = 500;
    const message = err.message || 'Internal server error';
    console.error(message);
    res.status(status).send({ success: false, message });
}
exports.errorHandler = errorHandler;
