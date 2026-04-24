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

        if (!user) throw new UnauthorizedException("Usuário não autenticado")

        // 1. Identifica a empresa (Busca no Header, Body ou Query)
        const companyIdFromRequest = request.headers['x-company-id'] || request.body?.companyId || request.query?.companyId

        // 2. Busca o vínculo de Agente (Pode ser Admin ou Agente operacional)
        const agent = await this.prisma.agent.findFirst({
            where: {
                userId: user.id,
                // Se um ID de empresa foi passado, filtramos por ele. 
                // Senão, pegamos o primeiro vínculo que o usuário tiver.
                ...(companyIdFromRequest ? { companyId: String(companyIdFromRequest) } : {})
            }
        })

        // 3. Trava de segurança para usuários comuns
        if (!agent && user.role !== Role.SUPER_ADMIN) {
            throw new UnauthorizedException("Você não possui um registro de Agente para esta empresa.")
        }

        // 4. Definição de Hierarquia e Permissões Dinâmicas
        let agentPermissions: string[] = []

        if (agent) {
            if (agent.role === 'ADMIN') {
                // ADMIN: Gestão total da empresa dele
                agentPermissions = [
                    ...Object.values(PERMISSIONS.queue),
                    ...Object.values(PERMISSIONS.queueEntry),
                    ...Object.values(PERMISSIONS.customer),
                    ...Object.values(PERMISSIONS.agent),
                    ...Object.values(PERMISSIONS.companySetting),
                    PERMISSIONS.company.READ,
                    PERMISSIONS.company.UPDATE,
                ]
            } else if (agent.role === 'AGENT') {
                // AGENT: Apenas operacional (Atendimento e Leitura)
                agentPermissions = [
                    PERMISSIONS.queue.READ,
                    PERMISSIONS.queueEntry.READ,
                    PERMISSIONS.queueEntry.UPDATE, // Pode chamar/atender
                    PERMISSIONS.customer.READ,
                    PERMISSIONS.customer.CREATE, // Pode cadastrar cliente no atendimento
                    PERMISSIONS.company.READ,
                ]
            }
        }

        // 5. Injeção de Contexto no Request
        // Isso permite que o Controller acesse 'user.companyId' com segurança
        request.user = {
            ...user,
            agentId: agent?.id,
            // O companyId final é: O da empresa vinculada ao agente OU o que o Super Admin escolheu
            companyId: agent?.companyId || companyIdFromRequest || user.companyId,
            permissions: Array.from(new Set([...(user.permissions || []), ...agentPermissions]))
        }

        return true
    }
}
