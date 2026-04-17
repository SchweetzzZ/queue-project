import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common"
import { PrismaService } from "src/prisma/prisma.service"
import { Role } from "../enums/roles.enums"
import { PERMISSIONS } from "../enums/permissions.enums"

@Injectable()
export class AgentGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) { }

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest()
        let { user } = request

        if (!user) throw new UnauthorizedException()

        // Fallback: se o role não estiver no objeto user (token antigo), busca no banco
        if (!user.role) {
            const dbUser = await this.prisma.user.findUnique({
                where: { id: user.id }
            })
            if (dbUser) {
                user.role = dbUser.role
            }
        }

        // Identifica a empresa para suportar multi-tenancy (Header, Body ou Query)
        const companyId = request.headers['x-company-id'] || request.body?.companyId || request.query?.companyId

        const agent = await this.prisma.agent.findFirst({
            where: {
                userId: user.id,
                ...(companyId ? { companyId: String(companyId) } : {})
            }
        })

        // Se não for super admin e não tiver agente, bloqueia
        if (!agent && user.role !== Role.SUPER_ADMIN) {
            throw new UnauthorizedException("Agent record not found for this context")
        }

        // Define as permissões baseadas no papel do agente dentro da empresa
        let agentPermissions: string[] = []
        if (agent) {
            if (agent.role === 'ADMIN') {
                agentPermissions = [
                    PERMISSIONS.company.READ,
                    PERMISSIONS.company.UPDATE,
                ]
            } else if (agent.role === 'AGENT') {
                agentPermissions = [
                    PERMISSIONS.company.READ,
                ]
            }
        }

        request.user = {
            ...user,
            agent,
            permissions: Array.from(new Set([...(user.permissions || []), ...agentPermissions]))
        }
        return true
    }
}