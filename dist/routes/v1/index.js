"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
const express_1 = require("express");
const CAUtil_1 = require("../../utils/CAUtil");
const register_1 = require("./register");
const file_1 = require("./file");
class AppRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this._init();
    }
    _init() {
        this.router.use('/file', file_1.default);
        this.router.use('/get-all', CAUtil_1.getAllAssets);
        this.router.use('/enroll', register_1.default);
        this.router.use('/ping', (_, res) => {
            res.status(200).send('Server connected!!!');
        });
    }
}
exports.appRouter = new AppRouter().router;
//# sourceMappingURL=index.js.map