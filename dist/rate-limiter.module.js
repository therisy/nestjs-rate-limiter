"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RateLimiterModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiterModule = void 0;
const common_1 = require("@nestjs/common");
const options_1 = require("./options");
const nestjs_redis_1 = require("@liaoliaots/nestjs-redis");
let RateLimiterModule = RateLimiterModule_1 = class RateLimiterModule {
    static forRoot(options = options_1.rateLimiterOptions) {
        return {
            imports: [
                nestjs_redis_1.RedisModule.forRoot({
                    config: {
                        host: options.redis.host || 'localhost',
                        port: options.redis.port || 6379,
                    },
                }),
            ],
            module: RateLimiterModule_1,
            providers: [{ provide: 'RateLimiterOptions', useValue: options }],
        };
    }
};
RateLimiterModule = RateLimiterModule_1 = __decorate([
    (0, common_1.Module)({
        exports: ['RateLimiterOptions'],
        providers: [{ provide: 'RateLimiterOptions', useValue: options_1.rateLimiterOptions }],
    })
], RateLimiterModule);
exports.RateLimiterModule = RateLimiterModule;
//# sourceMappingURL=rate-limiter.module.js.map