"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateKeyPair = void 0;
const node_forge_1 = __importDefault(require("node-forge"));
const generateKeyPair = (userId) => {
    const { privateKey, publicKey } = node_forge_1.default.pki.rsa.generateKeyPair(2048);
    const sshPublicKey = node_forge_1.default.ssh.publicKeyToOpenSSH(publicKey, `${userId}@localhost`);
    const sshPrivateKey = node_forge_1.default.ssh.privateKeyToOpenSSH(privateKey);
    const KeyFingerprint = node_forge_1.default.md.md5.create().update(sshPublicKey).digest().toHex();
    return {
        publicKey: sshPublicKey,
        KeyMaterial: sshPrivateKey,
        KeyFingerprint,
        KeyName: `${userId}-${Date.now()}`
    };
};
exports.generateKeyPair = generateKeyPair;
