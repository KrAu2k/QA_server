"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireAdmin = exports.ADMIN_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.ADMIN_KEY = 'requireAdmin';
const RequireAdmin = () => (0, common_1.SetMetadata)(exports.ADMIN_KEY, true);
exports.RequireAdmin = RequireAdmin;
//# sourceMappingURL=admin.decorator.js.map