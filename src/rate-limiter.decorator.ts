import { SetMetadata } from '@nestjs/common'
import { RateLimiterOptions } from './rate-limiter.interface'

export const RateLimit = ({ points, duration, keyPrefix, errorMessage }: RateLimiterOptions) => SetMetadata('rate-limit-options', { points, duration, keyPrefix, errorMessage })
