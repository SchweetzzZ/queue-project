import { Injectable } from "@nestjs/common"
import { PrismaService } from "src/prisma/prisma.service"
import type { ChatCreateDto, MessageSendDto } from "./schemas/chat-zod"

@Injectable()
export class ChatService {
    constructor(private readonly prisma: PrismaService) { }

    async createChat(data: ChatCreateDto) {
        const chat = await this.prisma.chat.create({
            data
        })
        return chat
    }

    async sendMessage(data: MessageSendDto) {
        const chat = await this.prisma.chat.findUnique({
            where: { id: data.chatId }
        });

        if (!chat) {
            throw new Error("Chat não encontrado");
        }

        const createMessage = await this.prisma.message.create({
            data: {
                chatId: data.chatId,
                companyId: chat.companyId,
                senderType: data.senderType,
                senderId: data.senderId,
                content: data.content
            }
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