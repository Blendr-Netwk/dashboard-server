"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("@/services/ethers");
const jwt_1 = require("@/services/jwt");
const user_1 = require("@/services/prisma/user");
const utils_1 = require("@/utils");
const sessions = {};
class UserController {
    async connectWallet(req, res, next) {
        try {
            const { signature, publicAddress } = req.body;
            if (!signature || signature === "" || !publicAddress || publicAddress === "")
                throw new Error("invalid body");
            const user = await (0, user_1.getUser)(publicAddress);
            if (!user)
                throw new Error("user not found");
            const pk = (0, ethers_1.verifyMessage)(user.nonce, signature);
            if (pk !== publicAddress)
                throw new Error("invalid signature");
            await (0, user_1.updateNonce)(publicAddress);
            const token = await (0, jwt_1.generateAuthToken)(user.id, publicAddress);
            res.status(200).send({ token });
        }
        catch (err) {
            next(err);
        }
    }
    async checkUser(req, res, next) {
        try {
            const { publicAddress } = req.body;
            if (!publicAddress || publicAddress === "")
                throw new Error("invalid body");
            const data = await (0, user_1.createUser)(publicAddress);
            res.status(200).send(data);
        }
        catch (err) {
            next(err);
        }
    }
    async updateUsername(req, res, next) {
        try {
            const { username } = req.body;
            if (!username || username === "")
                throw new Error("invalid body");
            const data = await (0, user_1.updateUsername)(req.user.id, username);
            res.status(200).send(data);
        }
        catch (err) {
            next(err);
        }
    }
    async getAuthenticatedUser(req, res, next) {
        try {
            res.status(200).send({ user: req.user });
        }
        catch (err) {
            next(err);
        }
    }
    async generateSessionId(req, res, next) {
        try {
            const { deviceId } = req.body;
            const sessionId = (0, utils_1.generateSessionId)();
            sessions[sessionId] = { deviceId, status: 'pending' };
            res.status(200).send({ sessionId });
        }
        catch (err) {
            next(err);
        }
    }
    async checkSessionId(req, res, next) {
        try {
            const { sessionId } = req.params;
            if (sessions[sessionId] && sessions[sessionId].cliToken) {
                res.json({
                    token: sessions[sessionId].cliToken,
                    publicAddress: sessions[sessionId].publicAddress
                });
                delete sessions[sessionId];
            }
            else {
                res.status(404).json({ error: 'Token not ready or session invalid' });
            }
        }
        catch (err) {
            next(err);
        }
    }
    async verifyUserSession(req, res, next) {
        try {
            //TODO: if generate auth errror make it status = error
            const { sessionId } = req.body;
            const cliToken = (0, jwt_1.generateAuthToken)(req.user.id, req.user.publicAddress);
            sessions[sessionId].cliToken = cliToken;
            sessions[sessionId].publicAddress = req.user.publicAddress;
            sessions[sessionId].status = "success";
            res.status(200).send({ success: true });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    }
    async updateTheSSHPublicKey(req, res, next) {
        try {
            const { sshPublicKey } = req.body;
            if (!sshPublicKey)
                throw new Error("invalid body");
            const updatedUser = await (0, user_1.updateSSHPublicKey)(req.user.id, sshPublicKey);
            res.status(200).send({ status: "success" });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.default = UserController;
