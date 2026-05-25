import {
    WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket,
    MessageBody, OnGatewayConnection, OnGatewayDisconnect, WsException
} from "@nestjs/websockets"
import { Server, Socket } from "socket.io"
import { ChatService } from "./chat.service"
import type { MessageSendDto } from "./schemas/chat-zod"
import { JwtService } from "@nestjs/jwt"

@WebSocketGateway({
    cors: {
        origin: "*"
    },
    namespace: "chat"
})

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server
    constructor(
        private readonly chatService: ChatService,
        private readonly jwtService: JwtService,
    ) { }

    //1
    handleConnection(client: Socket) {
        try {
            // Tenta pegar o token do handshake (auth, headers ou query)
            const token = client.handshake.auth?.token || 
                          client.handshake.headers?.authorization?.split(' ')[1] || 
                          client.handshake.query?.token;
            
            if (token) {
                const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET || 'secret' });
                client.data.user = payload; // Salva o usuário autenticado no socket
                console.log(`Cliente autenticado conectado: ${payload.email} (Socket ID: ${client.id})`);
            } else {
                console.log(`Cliente anônimo/customer conectado (Socket ID: ${client.id})`);
            }
        } catch (err) {
            console.log(`Falha na autenticação do socket: ${err.message}`);
        }
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
        @MessageBody() payload: MessageSendDto
    ) {
        // Se for um AGENT enviando, validamos se o ID dele bate com o ID do token por segurança
        if (payload.senderType === "AGENT") {
            const user = client.data.user;
            if (!user || user.sub !== payload.senderId) {
                throw new WsException("Não autorizado a enviar mensagem como este agente");
            }
        }

        const message = await this.chatService.sendMessage(payload)

        this.server.to(`chat:${payload.chatId}`).emit("new_message", message)

        return message
    }

    //Sala pessoal
    @SubscribeMessage("identify")
    handleIdentify(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { userId: string }
    ) {
        const personalRoom = `user:${data.userId}`
        client.join(personalRoom)
        console.log(`Cliente ${client.id} entrou na sala pessoal ${personalRoom}`)
        return { status: "Identified", room: personalRoom }
    }

}