import { Controller, Post, Body, Param, Delete, Get, Put, UseGuards, UnauthorizedException } from "@nestjs/common";
import { QueueService } from "./queue.service";
import { queueCreateSchema, type QueueCreateDto, type QueueUpdateDto } from "./schemas/queue-zod"
import { CurrentUser } from "../common/decorators/user.decorators";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { Roles } from "../common/decorators/roles.decorators";
import { Permissions } from "../common/decorators/permissons.decorators";
import { Role } from "../common/enums/roles.enums";
import { PERMISSIONS } from "../common/enums/permissions.enums";
import { ZodBody } from "../common/decorators/zod-decorator";

@Controller("queue")
export class QueueController {
    constructor(private readonly queueService: QueueService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
    @Permissions(PERMISSIONS.queue.CREATE)
    async create(@ZodBody(queueCreateSchema) data: QueueCreateDto, @CurrentUser() user: any) {
        const targetCompanyId = (user.role === Role.SUPER_ADMIN && data.companyId)
            ? data.companyId : user.companyId
        if (!targetCompanyId) throw new UnauthorizedException('Empresa não encontrada')
        return this.queueService.create(data, targetCompanyId)
    }

    @Put(":id")
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
    @Permissions(PERMISSIONS.queue.UPDATE)
    async update(@Body() data: QueueUpdateDto, @Param("id") id: string, @CurrentUser() user: any) {
        return this.queueService.update(data, id, user.companyId)
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
    @Permissions(PERMISSIONS.queue.DELETE)
    async delete(@Param("id") id: string, @CurrentUser() user: any) {
        return this.queueService.delete(id, user.companyId)
    }

    @Get(":id")
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Permissions(PERMISSIONS.queue.READ)
    async findOne(@Param("id") id: string, @CurrentUser() user: any) {
        return this.queueService.findOne(id, user.companyId)
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Permissions(PERMISSIONS.queue.READ)
    async findAll(@CurrentUser() user: any) {
        return this.queueService.findAll(user.companyId)
    }
}