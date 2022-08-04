"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const v1_1 = require("./v1");
const router = express.Router();
router.use('/api', v1_1.appRouter);
exports.default = router;
//# sourceMappingURL=index.js.map