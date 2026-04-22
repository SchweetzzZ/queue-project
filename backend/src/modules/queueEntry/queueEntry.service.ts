import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import type { QueueEntryCreateDto, QueueEntryUpdateDto } from "./schemas/queueEntry-zod";
import { RedisService } from "../redis/redis.service";
import { ChatService } from "../chat/chat.service";

@Injectable()
export class QueueEntryService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
        private readonly chatService: ChatService) { }

    async create(data: QueueEntryCreateDto, companyId: string) {
        const queueEntry = await this.prisma.queueEntry.create({
            data: {
                ...data,
                companyId,
                status: "WAITING",
            }
        })
        await this.redis.getClient().rpush(`queue:${queueEntry.queueId}`, queueEntry.id)
        return queueEntry
    }
    async callNext(queueId: string, companyId: string, agentId: string) {
        const entryId = await this.redis.getClient().lpop(`queue:${queueId}`)
        if (!entryId) return null
        try {
            const queue = await this.prisma.queueEntry.update({
                where: { id: entryId, companyId },
                data: {
                    status: "IN_PROGRESS",
                    agentId
                }
            })
            await this.chatService.createChat({
                queueEntryId: queue.id,
                companyId,
                agentId,
                customerId: queue.customerId
            })
            return queue
        }
        catch (error) {
            return this.callNext(queueId, companyId, agentId)
        }
    }
    async completeEntry(queueEntryId: string, companyId: string) {
        const complet = await this.prisma.queueEntry.update({
            where: { id: queueEntryId, companyId },
            data: {
                status: "COMPLETED",
            }
        })
        return complet
    }

    async getPosition(id: string, queueId: string) {
        const position = await this.redis.getClient().lpos(`queue:${queueId}`, id)
        if (position === null) return { position: -1, text: "Não está na fila" }

        return {
            position: position,
            text: `Você é a pessoa ${position + 1} na fila`
        }
    }
    async getMyPosition(customerId: string, companyId: string) {
        const entry = await this.prisma.queueEntry.findFirst({
            where: { customerId, companyId, status: "WAITING" },
            select: { id: true, queueId: true }
        });
        if (!entry) return { position: -1, text: "Você não está em nenhuma fila ativa" };
        return this.getPosition(entry.id, entry.queueId);
    }
    async cancelEntry(queueEntryId: string, companyId: string) {
        const queueEntry = await this.prisma.queueEntry.update({
            where: { id: queueEntryId, companyId },
            data: {
                status: "CANCELED",
            }
        })
        await this.redis.getClient().lrem(`queue:${queueEntry.queueId}`, 0, queueEntryId)
        return queueEntry
    }

    async repopulateRedis(queueId: string, companyId: string) {
        await this.redis.getClient().del(`queue:${queueId}`)

        const waitingEntries = await this.prisma.queueEntry.findMany({
            where: { queueId, status: "WAITING" },
            orderBy: { createdAt: "asc" }
        })
        for (const entry of waitingEntries) {
            await this.redis.getClient().rpush(`queue:${queueId}`, entry.id)
        }

        return { message: "Fila repopulada com sucesso" }
    }
    async findOne(id: string, companyId: string) {
        const queueEntry = await this.prisma.queueEntry.findUnique({
            where: { id, companyId }
        })
        return queueEntry
    }
    async findAll(companyId: string) {
        const queueEntries = await this.prisma.queueEntry.findMany({
            where: { companyId }
        })
        return queueEntries
    }
}