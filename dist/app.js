"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
// import morgan from "morgan";
// import { notFound, serverError } from "./middleware";
// import { corsOptions, IN_PROD } from "./config";
const routes_1 = require("./routes");
const config_1 = require("./config");
const errorHandler_1 = require("./middleware/errorHandler");
// import { morganOption } from "./config";
const createApp = () => {
    const app = (0, express_1.default)();
    // app.use(morgan('combined', morganOption));  
    //config
    app.use((0, cors_1.default)(config_1.corsOptions));
    app.use(body_parser_1.default.urlencoded({ limit: '50mb', extended: false }));
    app.use(body_parser_1.default.json({ limit: '50mb' }));
    //routers
    app.get("/", (req, res, next) => {
        res.status(200).send({
            name: "Blendr Server",
            message: "online",
            prod: config_1.IN_PROD
        });
    });
    app.use("/api", routes_1.user);
    app.use("/api", routes_1.openai);
    app.use("/api", routes_1.node);
    app.use("/api", routes_1.data);
    // app.use("/api", ai);
    //error handles
    app.use(errorHandler_1.errorHandler);
    // app.use(notFound);
    // app.use(serverError);
    return app;
};
exports.createApp = createApp;
