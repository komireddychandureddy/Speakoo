"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var node_path_1 = require("node:path");
var config_1 = require("prisma/config");
var dotenv = require("dotenv");
// Load environment-specific .env file first, then fall back to .env
var nodeEnv = (_a = process.env.NODE_ENV) !== null && _a !== void 0 ? _a : 'development';
dotenv.config({ path: node_path_1.default.resolve(__dirname, '..', ".env.".concat(nodeEnv)) });
dotenv.config({ path: node_path_1.default.resolve(__dirname, '..', '.env') });
exports.default = (0, config_1.defineConfig)({
    schema: node_path_1.default.resolve(__dirname, 'schema.prisma'),
    migrations: {
        path: node_path_1.default.resolve(__dirname, 'migrations'),
    },
    datasource: {
        url: process.env.DATABASE_URL,
    },
});
