import {DynamicModule, Module} from '@nestjs/common';
import {rateLimiterOptions} from "../options";
import {RedisModule} from "@liaoliaots/nestjs-redis";
import {RateLimiterRedisService} from "../service/rate-limiter-redis.service";

@Module({
    exports: ['RateLimiterOptions'],
    providers: [{ provide: 'RateLimiterOptions', useValue: rateLimiterOptions }],
})
export class RateLimiterModule {
    static forRoot(options: RateLimiterOptions = rateLimiterOptions): DynamicModule {
        return {
            imports: [
                RedisModule.forRoot({
                    config: {
                        host: options.redis.host || 'localhost',
                        port: options.redis.port || 6379,
                    },
                }),
            ],
            module: RateLimiterModule,
            providers: [{provide: 'RateLimiterOptions', useValue: options}],
            exports: [RateLimiterRedisService]
        };
    }

    static forRootAsync(options: RateLimiterOptions = rateLimiterOptions): DynamicModule {
        return {
            imports: [
                RedisModule.forRootAsync({
                    useFactory: () => ({
                        config: {
                            host: options.redis.host || 'localhost',
                            port: options.redis.port || 6379,
                        },
                    }),
                }),
            ],
            module: RateLimiterModule,
            providers: [{provide: 'RateLimiterOptions', useValue: options}],
            exports: [RateLimiterRedisService]
        };
    }
}
