import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import type { AgentDto, UpdateAgentDto } from "./schemas/agent-zod";

@Injectable()
export class AgentService {
    constructor(private readonly prisma: PrismaService) { }
    async create(data: AgentDto, companyId: string, userId: string) {
        return this.prisma.agent.create({
            data: {
                ...data,
                companyId,
                userId,
            },
        })
    }
    async update(data: UpdateAgentDto, id: string, companyId: string) {
        const updateAgent = await this.prisma.agent.update({
            where: {
                companyId_id: {
                    companyId,
                    id
                }
            },
            data: {
                ...data
            },
        })
        return updateAgent
    }
    async delete(id: string, companyId: string) {
        const deleteAgent = await this.prisma.agent.update({
            where: {
                companyId_id: {
                    companyId,
                    id
                }
            },
            data: {
                isActive: false,
                status: 'OFFLINE',
            },
        })
        return deleteAgent
    }
    async findById(id: string, companyId: string) {
        const findAgent = await this.prisma.agent.findUnique({
            where: {
                companyId_id: {
                    companyId,
                    id
                }
            },
            include: {
                user: true,
            }
        })
        if (!findAgent) {
            throw new Error("Agent not found")
        }
        return findAgent
    }

}