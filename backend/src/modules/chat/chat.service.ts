import { Injectable } from "@nestjs/common"
import { PrismaService } from "src/prisma/prisma.service"
import type { ChatCreateDto, MessageSendDto } from "./schemas/chat-zod.ts"

@Injectable()
export class ChatService {
    constructor(private readonly prisma: PrismaService) { }

    async createChat(data: ChatCreateDto) {
        const chat = await this.prisma.chat.create({
            data
        })
        return chat
    }
    async sendMessage(data: MessageSendDto, companyId: string) {
        const createMessage = await this.prisma.message.create({
            data: { ...data, companyId }
        })
        return createMessage
    }

    async getHistory(chatId: string, companyId: string) {
        const messages = await this.prisma.message.findMany({
            where: { chatId, companyId },
            orderBy: { createdAt: "asc" }
        })
        return messages
    }

    async getChat(chatId: string, companyId: string) {
        const chat = await this.prisma.chat.findFirst({
            where: { id: chatId, companyId }
        })
        return chat
    }
}