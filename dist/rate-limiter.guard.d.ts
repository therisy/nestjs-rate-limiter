import { Reflector } from '@nestjs/core';
import { ExecutionContext, CanActivate } from '@nestjs/common';
import { RateLimiterOptions } from './rate-limiter.interface';
import Redis from "ioredis";
export declare class RateLimiterGuard implements CanActivate {
    private options;
    private readonly reflector;
    private readonly redis;
    constructor(options: RateLimiterOptions, reflector: Reflector, redis: Redis);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private setResponseHeaders;
    private responseRateLimit;
    private requestIp;
    private httpContext;
}
//# sourceMappingURL=rate-limiter.guard.d.ts.map