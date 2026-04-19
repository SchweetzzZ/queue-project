import { Body, Controller, Post, Put, Delete, Get, Param } from "@nestjs/common"
import { CustomersService } from "./customers.service"
import { customerCreateSchema, updateCustomerSchema } from "./schemas/customers-zod"
import type { CustomerCreateDto, UpdateCustomerDto } from "./schemas/customers-zod"
import { ZodBody } from "../common/decorators/zod-decorator"
import { UseGuards } from "@nestjs/common"
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard"
import { AgentGuard } from "../common/guards/agent-guard"
import { RolesGuard } from "../common/guards/roles.guard"
import { PermissionsGuard } from "../common/guards/permissions.guard"
import { Roles } from "../common/decorators/roles.decorators"
import { Role } from "../common/enums/roles.enums"
import { Permissions } from "../common/decorators/permissons.decorators"
import { PERMISSIONS } from "../common/enums/permissions.enums"
import { CurrentUser } from "../common/decorators/user.decorators"

@Controller("customers")
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Post()
    @UseGuards(JwtAuthGuard, AgentGuard, RolesGuard, PermissionsGuard)
    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
    @Permissions(PERMISSIONS.customer.CREATE)
    async create(@ZodBody(customerCreateSchema) body: CustomerCreateDto, @CurrentUser() user: any) {
        return this.customersService.create(body, user.id)
    }
    @Put(":id")
    @UseGuards(JwtAuthGuard, AgentGuard, RolesGuard, PermissionsGuard)
    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
    @Permissions(PERMISSIONS.customer.UPDATE)
    async update(@ZodBody(updateCustomerSchema) body: UpdateCustomerDto, @Param("id") id: string, @CurrentUser() user: any) {
        return this.customersService.update(body, id, user.id)
    }
    @Delete(":id")
    @UseGuards(JwtAuthGuard, AgentGuard, RolesGuard, PermissionsGuard)
    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
    @Permissions(PERMISSIONS.customer.DELETE)
    async delete(@Param("id") id: string, @CurrentUser() user: any) {
        return this.customersService.delete(id, user.id)
    }
    @Get()
    @UseGuards(JwtAuthGuard, AgentGuard, RolesGuard, PermissionsGuard)
    @Permissions(PERMISSIONS.customer.READ)
    async findAll(@CurrentUser() user: any) {
        return this.customersService.findAll(user.id)
    }
    @Get(":id")
    @UseGuards(JwtAuthGuard, AgentGuard, RolesGuard, PermissionsGuard)
    @Permissions(PERMISSIONS.customer.READ)
    async findById(@Param("id") id: string, @CurrentUser() user: any) {
        return this.customersService.findOne(id, user.id)
    }
}