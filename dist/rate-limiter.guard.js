"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiterGuard = void 0;
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const nestjs_redis_1 = require("@liaoliaots/nestjs-redis");
const ioredis_1 = __importDefault(require("ioredis"));
let RateLimiterGuard = class RateLimiterGuard {
    constructor(options, reflector, redis) {
        this.options = options;
        this.reflector = reflector;
        this.redis = redis;
    }
    async canActivate(context) {
        const reflectedOptions = this.options;
        const { request, response } = this.httpContext(context);
        const ip = this.requestIp(request);
        await this.responseRateLimit(request, response, reflectedOptions, ip);
        return true;
    }
    setResponseHeaders(response, rateLimiterResponse) {
        response.header('X-Rate-Limit-Remaining', rateLimiterResponse.remainingPoints);
        response.header('X-Rate-Limit-Limit', rateLimiterResponse.points);
        if (rateLimiterResponse.remainingPoints === 0) {
            const date = new Date(Number(rateLimiterResponse.msBeforeNext));
            response.header('Retry-After', date.toUTCString());
        }
        else {
            const date = new Date(Number(rateLimiterResponse.msBeforeNext));
            response.header('Retry-Reset', date.toUTCString());
        }
    }
    async responseRateLimit(request, response, reflectedOptions, ip) {
        const duration = new Date().setMinutes(new Date().getMinutes() + reflectedOptions.duration);
        const key = `${reflectedOptions.keyPrefix}:${request.ip}`;
        const redisResponse = await this.redis.zcount(key, 0, duration);
        const unixTimestamp = Date.now() / 1000;
        if (!redisResponse || redisResponse < reflectedOptions.points && (duration / 1000) > unixTimestamp) {
            await this.redis.expire(key, 60 * reflectedOptions.duration);
            const currentDate = new Date();
            currentDate.setMinutes(currentDate.getMinutes() + reflectedOptions.duration);
            await this.redis.zadd(key, 1, currentDate.getTime() / 1000);
        }
        const firstOfResponse = await this.redis.zrange(key, 0, 0);
        const firstDuration = firstOfResponse[0];
        if (unixTimestamp > firstDuration) {
            await this.redis.del(key);
            await this.redis.expire(key, 60 * reflectedOptions.duration);
            const currentDate = new Date();
            currentDate.setMinutes(currentDate.getMinutes() + reflectedOptions.duration);
            await this.redis.zadd(key, 1, currentDate.getTime() / 1000);
        }
        const lastOfResponse = await this.redis.zrange(key, -1, -1);
        const lastDuration = lastOfResponse[0];
        const rateLimiterResponse = {
            remainingPoints: reflectedOptions.points - redisResponse,
            msBeforeNext: lastDuration * 1000,
            points: reflectedOptions.points
        };
        if (redisResponse >= reflectedOptions.points && unixTimestamp < lastDuration) {
            this.setResponseHeaders(response, rateLimiterResponse);
            if (reflectedOptions.logger) {
                common_1.Logger.warn(`Rate limit exceeded for ip: ${ip}`, 'RateLimiterGuard');
            }
            throw new common_1.HttpException(reflectedOptions.errorMessage, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        else {
            const firstOfResponse = await this.redis.zrange(key, 0, 0);
            const firstDuration = firstOfResponse[0];
            rateLimiterResponse.msBeforeNext = firstDuration * 1000;
            this.setResponseHeaders(response, rateLimiterResponse);
        }
    }
    requestIp(request) {
        return request.ip || request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    }
    httpContext(context) {
        if (this.options.for === 'FastifyGraphql') {
            return {
                request: context.getArgByIndex(2).req,
                response: context.getArgByIndex(2).res
            };
        }
        else if (this.options.for === 'ExpressGraphql') {
            return {
                request: context.getArgByIndex(2).req,
                response: context.getArgByIndex(2).req.res
            };
        }
        return {
            request: context.switchToHttp().getRequest(),
            response: context.switchToHttp().getResponse()
        };
    }
};
RateLimiterGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('RateLimiterOptions')),
    __param(1, (0, common_1.Inject)('Reflector')),
    __param(2, (0, nestjs_redis_1.InjectRedis)()),
    __metadata("design:paramtypes", [Object, core_1.Reflector,
        ioredis_1.default])
], RateLimiterGuard);
exports.RateLimiterGuard = RateLimiterGuard;
//# sourceMappingURL=rate-limiter.guard.js.map