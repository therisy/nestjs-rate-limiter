type RateLimitFramework = 'Express' | 'Fastify' | 'Microservice' | 'ExpressGraphql' | 'FastifyGraphql'

interface IRedis {
    host: string;
    port: number;
}

interface RateLimiterOptions {
    framework: RateLimitFramework
    redis?: IRedis;
    keyPrefix: string
    points: number
    duration: number
    errorMessage?: string
    logger?: boolean
}

interface IRateLimiterResponse {
    remainingPoints: number
    points: number
    beforeNext: number
}

export { IRedis, RateLimiterOptions, IRateLimiterResponse }
