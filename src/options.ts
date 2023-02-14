import {RateLimiterOptions} from "./interfaces/rate-limiter.interface";

export const rateLimiterOptions: RateLimiterOptions = {
    for: 'Express',
    redis: {
        host: 'localhost',
        port: 6379,
    },
    keyPrefix: 'global',
    points: 4,
    duration: 1,
    errorMessage: 'Rate limit exceeded',
}
