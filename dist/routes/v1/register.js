"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CAUtil_1 = require("../../utils/CAUtil");
const router = (0, express_1.Router)();
router.post('/user', CAUtil_1.registerUser);
router.post('/login', CAUtil_1.login);
exports.default = router;
//# sourceMappingURL=register.js.map