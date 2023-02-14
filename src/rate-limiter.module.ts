import {DynamicModule, Module} from '@nestjs/common';
import {rateLimiterOptions} from "./options";
import {RateLimiterOptions} from "./interfaces/rate-limiter.interface";
import {RedisModule} from "@liaoliaots/nestjs-redis";

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
        };
    }
}
