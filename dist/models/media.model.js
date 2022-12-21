"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaModel = void 0;
const mongoose_1 = require("mongoose");
const media_schema_1 = require("./media.schema");
exports.MediaModel = (0, mongoose_1.model)("media", media_schema_1.default);
//# sourceMappingURL=media.model.js.map