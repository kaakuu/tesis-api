"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer = require("multer");
const CAUtil_1 = require("../../utils/CAUtil");
const router = express_1.Router();
const imageFilter = function (req, file, cb) {
    // accept image only
    console.log(file);
    if (!file.originalname.match(/\.(pdf|txt)$/)) {
        return cb(new Error('Only pdf files are allowed!'), false);
    }
    cb(null, true);
};
const upload = multer({ storage: multer.memoryStorage(), fileFilter: imageFilter }); // multer configuration
router.post('/upload', upload.single('file'), CAUtil_1.uploadFile);
router.post('/validate', upload.single('file'), CAUtil_1.validateDocumentOnChain);
exports.default = router;
//# sourceMappingURL=file.js.map