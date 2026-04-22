import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common"
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
    public readonly client: Redis;
    constructor() {
        this.client = new Redis(process.env.REDIS_URL!)

        this.client.on("connect", () => {
            console.log("Redis conectado com sucesso!")
        })

        this.client.on("error", (err) => {
            console.log("Erro ao conectar com o Redis: ", err)
        })
    }
    getClient() {
        return this.client
    }
    async onModuleInit() {
        return this.client.ping()
    }
    async onModuleDestroy() {
        return this.client.quit()
    }
}