import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import type { QueueCreateDto, QueueUpdateDto } from "./schemas/queue-zod"

@Injectable()
export class QueueService {
    constructor(private readonly prisma: PrismaService) { }
    async create(data: QueueCreateDto, companyId: string) {
        const queue = await this.prisma.queue.create({
            data: {
                name: data.name,
                company: {
                    connect: {
                        id: companyId
                    }
                }
            }
        })
        return queue
    }
    async update(data: QueueUpdateDto, id: string, companyId: string) {
        const queue = await this.prisma.queue.update({
            where: { id, companyId },
            data: {
                name: data.name
            }
        })
        return queue
    }
    async delete(id: string, companyId: string) {
        const queue = await this.prisma.queue.delete({
            where: { id, companyId }
        })
        return queue
    }
    async findOne(id: string, companyId: string) {
        const queue = await this.prisma.queue.findUnique({
            where: { id, companyId }
        })
        return queue
    }
    async findAll(companyId: string) {
        const queues = await this.prisma.queue.findMany({
            where: { companyId }
        })
        return queues
    }
}
