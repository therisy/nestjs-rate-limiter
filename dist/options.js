"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiterOptions = void 0;
exports.rateLimiterOptions = {
    for: 'Express',
    redis: {
        host: 'localhost',
        port: 6379,
    },
    keyPrefix: 'global',
    points: 4,
    duration: 1,
    errorMessage: 'Rate limit exceeded',
};
//# sourceMappingURL=options.js.map