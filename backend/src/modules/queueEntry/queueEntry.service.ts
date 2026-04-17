import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import type { QueueEntryCreateDto, QueueEntryUpdateDto } from "./schemas/queueEntry-zod";

@Injectable()
export class QueueEntryService {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: QueueEntryCreateDto, companyId: string) {
        const queueEntry = await this.prisma.queueEntry.create({
            data: {
                ...data,
                companyId
            }
        })
        return queueEntry
    }
    async update(data: QueueEntryUpdateDto, id: string, companyId: string) {
        const queueEntry = await this.prisma.queueEntry.update({
            where: { id, companyId },
            data
        })
        return queueEntry
    }
    async delete(id: string, companyId: string) {
        const queueEntry = await this.prisma.queueEntry.delete({
            where: { id, companyId }
        })
        return queueEntry
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