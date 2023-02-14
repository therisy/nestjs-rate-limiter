# Nestjs Rate Limiter

Nestjs Rate Limiter is a module for Nestjs that provides a rate limiter for Express, Fastify, Microservice, ExpressGraphql, and FastifyGraphql.

## Basic Usage

> app.module.ts
```typescript
import { RateLimiterModule } from '@risy/nestjs-rate-limiter';

@Module({
    imports: [
        RateLimiterModule.forRoot({
            for: 'Express',
            keyPrefix: 'global',
            points: 10, // 10 requests
            duration: 1, // per 1 second by IP
            errorMessage: 'Too many requests, please try again later.',
            logger: true,
            redis: {
                host: 'localhost',
                port: 6379,
            }
        })
    ],
})

export class AppModule  {}
```

## Use For All Routes
```typescript
import { RateLimiterModule } from '@risy/nestjs-rate-limiter';

@Module({
    imports: [
        RateLimiterModule.forRoot({
            ...
        })
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: RateLimiterGuard
        }
    ]
})
```

## Use Guard
```typescript
import { Controller, Get } from '@nestjs/common';
import { UseGuards } from '@nestjs/common/decorators';
import { RateLimiterGuard } from '@risy/nestjs-rate-limiter';

@Controller()
export class AppController {
  @UseGuards(RateLimiterGuard)
  @Get()
  getHello() {
    return 'Hello World!';
  }
}
```

## Use Decorator
```typescript
import { Controller, Get } from '@nestjs/common';
import { RateLimiter, RateLimiterGuard } from '@risy/nestjs-rate-limiter';

@Controller()
export class AppController {
  @RateLimiter({
    points: 10, // 10 requests
    duration: 1, // per 1 second by IP
    errorMessage: 'Too many requests, please try again later.',
    logger: true,
    redis: {
        host: 'localhost',
        port: 6379,
    }
  })
  @UseGuards(RateLimiterGuard)
  @Get()
  getHello() {
    return 'Hello World!';
  }
}
```

## Options
```typescript
export interface RateLimiterOptions {
    for: 'Express' | 'Fastify' | 'Microservice' | 'ExpressGraphql' | 'FastifyGraphql'
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
```
