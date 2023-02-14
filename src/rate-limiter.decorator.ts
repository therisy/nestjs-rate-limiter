import { SetMetadata } from '@nestjs/common'
import { RateLimiterOptions } from './rate-limiter.interface'

export const RateLimit = (options?: RateLimiterOptions): MethodDecorator => SetMetadata('rate-limit-options', options)
