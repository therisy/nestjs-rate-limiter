import { SetMetadata } from '@nestjs/common'

export const RateLimit = ({ points, duration, keyPrefix, errorMessage }: RateLimiterOptions) => SetMetadata('rate-limit-options', { points, duration, keyPrefix, errorMessage })
