"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitRevokeLendNode = exports.emitLendNode = exports.emitCommand = exports.emitNewTask = exports.emitTest = void 0;
const redis_1 = require("@/services/redis");
const redis_emitter_1 = require("@socket.io/redis-emitter");
const emitter = new redis_emitter_1.Emitter(redis_1.pubClient);
const mainEmitter = emitter.of("/");
const emitTest = (socketID, payload) => {
    mainEmitter.to(socketID).emit("BMAIN: test", payload);
};
exports.emitTest = emitTest;
const emitNewTask = (socketID, payload) => {
    mainEmitter.to(socketID).emit("BMAIN: NEW_TASK", payload);
};
exports.emitNewTask = emitNewTask;
const emitCommand = (socketID, payload) => {
    mainEmitter.to(socketID).emit("BMAIN: COMMAND'", payload);
};
exports.emitCommand = emitCommand;
const emitLendNode = (socketID, payload) => {
    mainEmitter.to(socketID).emit("BMAIN: LEND_GPU", payload);
};
exports.emitLendNode = emitLendNode;
const emitRevokeLendNode = (socketID, payload) => {
    mainEmitter.to(socketID).emit("BMAIN: REVOKE_LENDING", payload);
};
exports.emitRevokeLendNode = emitRevokeLendNode;
