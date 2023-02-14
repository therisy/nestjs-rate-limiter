type RateLimitFramework = 'Express' | 'Fastify' | 'Microservice' | 'ExpressGraphql' | 'FastifyGraphql'

interface RateLimiterOptions {
    for: RateLimitFramework
    redis?: {
        host: string
        port: number
    }
    keyPrefix?: string
    points: number
    duration: number
    errorMessage?: string
    logger?: boolean
}

interface IRateLimiterResponse {
    remainingPoints: number
    points: number
    msBeforeNext: number
}

export { RateLimiterOptions, IRateLimiterResponse }
