import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common"
import { PrismaService } from "src/prisma/prisma.service"
import { Role } from "../enums/roles.enums"

@Injectable()
export class AgentGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) { }

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest()
        let { user } = request

        if (!user) throw new UnauthorizedException()

        // Fallback: se o role no estiver no objeto user (token antigo), busca no banco
        if (!user.role) {
            const dbUser = await this.prisma.user.findUnique({
                where: { id: user.id }
            })
            if (dbUser) {
                user.role = dbUser.role
            }
        }

        const agent = await this.prisma.agent.findFirst({
            where: {
                userId: user.id,
            }
        })

        // Se no for super admin e no tiver agente, bloqueia
        if (!agent && user.role !== Role.SUPER_ADMIN) {
            throw new UnauthorizedException("Agent record not found")
        }

        request.user = {
            ...user,
            agent
        }
        return true
    }
}