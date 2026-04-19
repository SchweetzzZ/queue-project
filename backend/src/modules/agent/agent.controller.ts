import { Controller, Post, Body, Param, Patch, Delete, Get, UseGuards, BadRequestException, UsePipes } from "@nestjs/common"
import { AgentService } from "./agent.service"
import { type AgentDto, type UpdateAgentDto, agentSchema } from "./schemas/agent-zod"
import { ZodValidationPipe } from "../common/pipe/zod-validatin-pipe"
import { CurrentUser } from "../common/decorators/user.decorators"
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard"
import { RolesGuard } from "../common/guards/roles.guard"
import { PermissionsGuard } from "../common/guards/permissions.guard"
import { Roles } from "../common/decorators/roles.decorators"
import { Permissions } from "../common/decorators/permissons.decorators"
import { Role } from "../common/enums/roles.enums"
import { PERMISSIONS } from "../common/enums/permissions.enums"
import { AgentGuard } from "../common/guards/agent-guard"
import { ZodBody } from "../common/decorators/zod-decorator"

@Controller('agent')
export class AgentController {
    constructor(private readonly agentService: AgentService) { }
    @Post()
    @UseGuards(JwtAuthGuard, AgentGuard, RolesGuard, PermissionsGuard)
    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
    @Permissions(PERMISSIONS.agent.CREATE)
    async create(@ZodBody(agentSchema) dto: AgentDto, @CurrentUser() user: any) {
        const companyId = dto.companyId || user.agent?.companyId

        if (!companyId) {
            throw new BadRequestException("Company ID is required")
        }

        return this.agentService.create(dto, companyId)
    }
}