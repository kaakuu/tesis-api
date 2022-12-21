"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer = require("multer");
const media_service_1 = require("../../services/media.service");
const CAUtil_1 = require("../../utils/CAUtil");
const router = (0, express_1.Router)();
const storage = multer.memoryStorage();
const upload = multer({ storage }); // multer configuration
router.post('/upload', upload.single('file'), CAUtil_1.uploadFile);
router.get('/files', media_service_1.getFiles);
router.post('/validate', upload.single('file'), CAUtil_1.validateDocumentOnChain);
exports.default = router;
//# sourceMappingURL=file.js.map