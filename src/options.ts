export const rateLimiterOptions: RateLimiterOptions = {
    framework: 'Express',
    redis: {
        host: 'localhost',
        port: 6379,
    },
    keyPrefix: 'global',
    points: 4,
    duration: 1,
    errorMessage: 'Rate limit exceeded',
}
