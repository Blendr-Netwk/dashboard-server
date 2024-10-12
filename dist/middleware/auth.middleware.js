"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.authenticateAdmin = exports.authenticateJwt = void 0;
const jwt_1 = require("@/services/jwt");
const user_1 = require("@/services/prisma/user");
const authenticateJwt = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (!token || token === "" || token == undefined)
            throw new Error("no token");
        let user = await (0, exports.verifyToken)(token);
        req.user = user;
        // throw new Unauthorized('no user found')
        if (req.user === undefined) {
            throw new Error("internal Error");
        }
        next();
    }
    catch (err) {
        next(err);
    }
};
exports.authenticateJwt = authenticateJwt;
const authenticateAdmin = async (req, res, next) => {
    try {
        // const authHeader = req.headers["authorization"];
        // const token = authHeader && authHeader.split(" ")[1];
        // let user = (await verifyToken(token)) as IUser;
        // req.user = user;
        // // throw new Unauthorized('no user found')
        // if (req.user === undefined) {
        //   throw new Error("internal Error");
        // }
        // if (req.user.role !== "ADMIN") {
        //   throw new Error("unauthorised (admin only)")
        // }
        next();
    }
    catch (err) {
        next(err);
    }
};
exports.authenticateAdmin = authenticateAdmin;
const verifyToken = async (token) => {
    let payload = await (0, jwt_1.verifyJWTToken)(token);
    const user = await (0, user_1.getUser)(payload.publicAddress);
    if (!user)
        throw new Error("no user found");
    return user;
};
exports.verifyToken = verifyToken;
