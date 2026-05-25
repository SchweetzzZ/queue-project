import { Controller, Body, Put, Post, Req, Param, UseGuards, Delete, Get, Patch, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { QueueEntryService } from "./queueEntry.service";
import { QueueEntryCreateSchema } from "./schemas/queueEntry-zod";
import type { QueueEntryCreateDto } from "./schemas/queueEntry-zod";
import { ZodBody } from "../common/decorators/zod-decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { Roles } from "../common/decorators/roles.decorators";
import { Role } from "../common/enums/roles.enums";
import { Permissions } from "../common/decorators/permissons.decorators";
import { PERMISSIONS } from "../common/enums/permissions.enums";
import { CurrentUser } from "../common/decorators/user.decorators";
import { AgentGuard } from "../common/guards/agent-guard";

@Controller("queue-entry")
export class QueueEntryController {
    constructor(
        private readonly queueEntryService: QueueEntryService,
    ) { }

    @Post()
    async create(@Req() req: any, @ZodBody(QueueEntryCreateSchema) data: QueueEntryCreateDto) {
        const companyId = data.companyId || req.headers['x-company-id'];
        if (!companyId) {
            throw new BadRequestException('ID da empresa (companyId no corpo ou x-company-id no header) é obrigatório para entrar na fila');
        }
        return this.queueEntryService.create(data, companyId);
    }

    @Post(":queueId/call-next")
    @UseGuards(JwtAuthGuard, AgentGuard, RolesGuard, PermissionsGuard)
    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
    @Permissions(PERMISSIONS.queueEntry.UPDATE)
    async callNext(@Param("queueId") queueId: string, @CurrentUser() user: any) {
        return this.queueEntryService.callNext(queueId, user.companyId, user.agentId)
    }

    @Patch(":queueEntryId/complete")
    @UseGuards(JwtAuthGuard, AgentGuard, RolesGuard, PermissionsGuard)
    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
    @Permissions(PERMISSIONS.queueEntry.UPDATE)
    async completeEntry(@Param("queueEntryId") queueEntryId: string, @CurrentUser() user: any) {
        return this.queueEntryService.completeEntry(queueEntryId, user.companyId)
    }

    @Delete(":queueEntryId/cancel")
    @UseGuards(JwtAuthGuard, AgentGuard, RolesGuard, PermissionsGuard)
    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
    @Permissions(PERMISSIONS.queueEntry.DELETE)
    async cancelEntry(@Param("queueEntryId") queueEntryId: string, @CurrentUser() user: any) {
        return this.queueEntryService.cancelEntry(queueEntryId, user.companyId)
    }

    @Get(":queueId/position/:id")
    async getPosition(@Param("queueId") queueId: string, @Param("id") id: string) {
        return this.queueEntryService.getPosition(id, queueId)
    }

    //Admin sincroniza Redis com banco
    @Post(":queueId/sync")
    @UseGuards(JwtAuthGuard, AgentGuard, RolesGuard, PermissionsGuard)
    @Roles(Role.SUPER_ADMIN)
    @Permissions(PERMISSIONS.queueEntry.UPDATE)
    async syncRedis(@Param("queueId") queueId: string, @CurrentUser() user: any) {
        return this.queueEntryService.repopulateRedis(queueId, user.companyId)
    }

    @Get()
    @UseGuards(JwtAuthGuard, AgentGuard, RolesGuard, PermissionsGuard)
    @Permissions(PERMISSIONS.queueEntry.READ)
    async findAll(@CurrentUser() user: any) {
        return this.queueEntryService.findAll(user.companyId)
    }

    @Get(":id")
    @UseGuards(JwtAuthGuard, AgentGuard, RolesGuard, PermissionsGuard)
    @Permissions(PERMISSIONS.queueEntry.READ)
    async findOne(@Param("id") id: string, @CurrentUser() user: any) {
        return this.queueEntryService.findOne(id, user.companyId)
    }
}