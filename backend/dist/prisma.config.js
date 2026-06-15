"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runtime_1 = require("@prisma/client/runtime");
exports.default = (0, runtime_1.defineConfig)({
    datasource: {
        db: {
            provider: 'postgresql',
            url: process.env.DATABASE_URL,
        },
    },
});
//# sourceMappingURL=prisma.config.js.map