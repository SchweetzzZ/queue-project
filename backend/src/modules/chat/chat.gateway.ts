import {
    WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket,
    MessageBody, OnGatewayConnection, OnGatewayDisconnect
} from "@nestjs/websockets"
import { Server, Socket } from "socket.io"
import { ChatService } from "./chat.service"
import type { MessageSendDto } from "./schemas/chat-zod"

@WebSocketGateway({
    cors: {
        origin: "*"
    },
    namespace: "chat"
})

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server
    constructor(private readonly chatService: ChatService) { }

    //1
    handleConnection(client: Socket) {
        console.log(`Cliente conectado: ${client.id}`)
    }
    handleDisconnect(client: Socket) {
        console.log(`Cliente desconectado: ${client.id}`)
    }

    //2
    @SubscribeMessage("join_chat")
    handleJoinChat(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { chatId: string }) {
        const room = `chat:${payload.chatId}`

        client.join(room)

        console.log(`Cliente ${client.id} entrou na sala ${room}`)

        return { event: "joined!", room }
    }

    //3 sair da sla
    @SubscribeMessage("leave_chat")
    handleLeaveChat(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { chatId: string }
    ) {
        client.leave(`chat:${payload.chatId}`);
    }

    //4 envia mensagem
    @SubscribeMessage("send_message")
    async handleSendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: MessageSendDto & { companyId: string }
    ) {

        const message = await this.chatService.sendMessage(payload, payload.companyId)

        this.server.to(`chat:${payload.chatId}`).emit("new_message", message)

        return message
    }

    //Sala pessoal
    @SubscribeMessage("identify")
    handleIdentify(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { userId: string }
    ) {
        const personalRoom = `user:${payload.userId}`
        client.join(personalRoom)
        console.log(`Cliente ${client.id} entrou na sala pessoal ${personalRoom} criada`)
        return { status: "Identified", room: personalRoom }
    }

}