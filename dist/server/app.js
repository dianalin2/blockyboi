"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const app = express_1.default();
app.use('/', express_1.default.static(path_1.default.join(__dirname, '../client')));
app.listen(parseInt(process.env.PORT, 10) || 8080, process.env.HOST || "0.0.0.0", () => {
    // console.log("Express server started");
});
//# sourceMappingURL=app.js.map