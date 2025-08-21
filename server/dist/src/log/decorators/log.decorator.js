"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = exports.LOG_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.LOG_KEY = 'log';
const Log = (options) => (0, common_1.SetMetadata)(exports.LOG_KEY, options);
exports.Log = Log;
//# sourceMappingURL=log.decorator.js.map