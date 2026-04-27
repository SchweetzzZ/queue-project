import { Controller, UseGuards, Post, Get, Param } from "@nestjs/common"
import { ChatService } from "./chat.service"
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard"
import { messageSendSchema } from "./schemas/chat-zod"
import type { MessageSendDto } from "./schemas/chat-zod"
import { CurrentUser } from "../common/decorators/user.decorators"
import { ZodBody } from "../common/decorators/zod-decorator"

@Controller("chat")
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post("send")
    @UseGuards(JwtAuthGuard)
    async sendMessage(@ZodBody(messageSendSchema) data: MessageSendDto, @CurrentUser() user: any) {
        return this.chatService.sendMessage(data)
    }
    @Get(":chatId/historical")
    @UseGuards(JwtAuthGuard)
    async getHistorical(@Param("chatId") chatId: string, @CurrentUser() user: any) {
        return this.chatService.getHistory(chatId, user.companyId)
    }
    @Get(":chatId")
    @UseGuards(JwtAuthGuard)
    async getChat(@Param("chatId") chatId: string, @CurrentUser() user: any) {
        return this.chatService.getChat(chatId, user.companyId)
    }
}