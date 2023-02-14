import {Reflector} from '@nestjs/core'
import {Injectable, ExecutionContext, Inject, CanActivate, HttpException, HttpStatus, Logger} from '@nestjs/common'
import {IRateLimiterResponse, RateLimiterOptions} from './rate-limiter.interface'
import {InjectRedis} from "@liaoliaots/nestjs-redis";
import Redis from "ioredis";

@Injectable()
export class RateLimiterGuard implements CanActivate {
    constructor(
        @Inject('RateLimiterOptions') private options: RateLimiterOptions,
        @Inject('Reflector') private readonly reflector: Reflector,
        @InjectRedis() private readonly redis: Redis
    ) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        let reflectedOptions: RateLimiterOptions = this.reflector.get<RateLimiterOptions>('rate-limit-options', context.getHandler())

        if (!reflectedOptions) {
            reflectedOptions = this.options;
        }

        const {request, response} = this.httpContext(context);
        const ip = this.requestIp(request);

        await this.responseRateLimit(request, response, reflectedOptions, ip)
        return true
    }

    private setResponseHeaders(response: any, rateLimiterResponse: IRateLimiterResponse) {
        response.header('X-Rate-Limit-Remaining', rateLimiterResponse.remainingPoints)
        response.header('X-Rate-Limit-Limit', rateLimiterResponse.points)

        if (rateLimiterResponse.remainingPoints === 0) {
            const date = new Date(Number(rateLimiterResponse.msBeforeNext));
            response.header('Retry-After', date.toUTCString());
        } else {
            const date = new Date(Number(rateLimiterResponse.msBeforeNext));
            response.header('Retry-Reset', date.toUTCString())
        }
    }

    private async responseRateLimit(request: any, response: any, reflectedOptions: RateLimiterOptions, ip) {
        const duration = new Date().setMinutes(new Date().getMinutes() + reflectedOptions.duration)
        const key = `${reflectedOptions.keyPrefix}:${request.ip}`
        const redisResponse = await this.redis.zcount(key, 0, duration)
        const unixTimestamp = Date.now() / 1000;

        if (!redisResponse || redisResponse < reflectedOptions.points && (duration / 1000) > unixTimestamp) {
            await this.redis.expire(key, 60 * reflectedOptions.duration)

            const currentDate = new Date();
            currentDate.setMinutes(currentDate.getMinutes() + reflectedOptions.duration);
            await this.redis.zadd(key, 1, currentDate.getTime() / 1000)
        }

        const firstOfResponse = await this.redis.zrange(key, 0, 0);
        const firstDuration = firstOfResponse[0] as unknown as number;

        if (unixTimestamp > firstDuration) {
            await this.redis.del(key)
            await this.redis.expire(key, 60 * reflectedOptions.duration)

            const currentDate = new Date();
            currentDate.setMinutes(currentDate.getMinutes() + reflectedOptions.duration);
            await this.redis.zadd(key, 1, currentDate.getTime() / 1000)
        }

        const lastOfResponse = await this.redis.zrange(key, -1, -1);
        const lastDuration = lastOfResponse[0] as unknown as number;

        const rateLimiterResponse: IRateLimiterResponse = {
            remainingPoints: reflectedOptions.points - redisResponse,
            msBeforeNext: lastDuration * 1000,
            points: reflectedOptions.points
        }

        if (redisResponse >= reflectedOptions.points && unixTimestamp < lastDuration) {
            this.setResponseHeaders(response, rateLimiterResponse)

            if (reflectedOptions.logger) {
                Logger.warn(`Rate limit exceeded for ip: ${ip}`, 'RateLimiterGuard')
            }

            throw new HttpException(reflectedOptions.errorMessage, HttpStatus.TOO_MANY_REQUESTS);
        } else {
            const firstOfResponse = await this.redis.zrange(key, 0, 0);
            const firstDuration = firstOfResponse[0] as unknown as number;

            rateLimiterResponse.msBeforeNext = firstDuration * 1000;

            this.setResponseHeaders(response, rateLimiterResponse)
        }
    }

    private requestIp(request: any) {
        return request.ip || request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    }

    private httpContext(context: ExecutionContext) {
        if (this.options.for === 'FastifyGraphql') {
            return {
                request: context.getArgByIndex(2).req,
                response: context.getArgByIndex(2).res
            }
        } else if (this.options.for === 'ExpressGraphql') {
            return {
                request: context.getArgByIndex(2).req,
                response: context.getArgByIndex(2).req.res
            }
        }

        return {
            request: context.switchToHttp().getRequest(),
            response: context.switchToHttp().getResponse()
        }
    }
}
