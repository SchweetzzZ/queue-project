import { Controller, Get } from "@nestjs/common"
import { HealthCheck, HealthCheckService, MemoryHealthIndicator, PrismaHealthIndicator, HealthCheckError, HealthIndicatorResult } from "@nestjs/terminus"
import { PrismaService } from "../../prisma/prisma.service"
import { RedisService } from "../redis/redis.service"

@Controller("healthConect")
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private prismaHealth: PrismaHealthIndicator,
        private memory: MemoryHealthIndicator,
        private prisma: PrismaService,
        private redisService: RedisService,
    ) { }

    @Get()
    @HealthCheck()
    check() {
        return this.health.check([
            // 1. Testa o Banco de Dados
            () => this.prismaHealth.pingCheck('database', this.prisma),

            // 2. Testa o Redis (Custom Check usando seu RedisService)
            async (): Promise<HealthIndicatorResult> => {
                try {
                    await this.redisService.client.ping();
                    return { redis: { status: 'up' } };
                } catch (e) {
                    throw new HealthCheckError('Redis check failed', { redis: { status: 'down' } });
                }
            },

            // 3. Garante que o processo não use mais de 150MB de RAM
            () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
        ]);
    }
}

