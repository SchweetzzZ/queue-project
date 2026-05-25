import { Module } from "@nestjs/common"
import { ChatController } from "./chat.controller"
import { ChatService } from "./chat.service"
import { PrismaModule } from "src/prisma/prisma.module"
import { ChatGateway } from "./chat.gateway"
import { JwtModule } from "@nestjs/jwt"

@Module({
    imports: [
        PrismaModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'secret',
            signOptions: { expiresIn: '1d' },
        })
    ],
    controllers: [ChatController],
    providers: [ChatService, ChatGateway],
    exports: [ChatService, ChatGateway]
})
export class ChatModule { }