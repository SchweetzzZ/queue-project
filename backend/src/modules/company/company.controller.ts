import { Controller, Post, Body, Put, Delete, Get, Param, UseGuards } from "@nestjs/common";
import { CompanyService } from "./company.service";
import type { CompanyDto, UpdateCompanyDto } from "./schemas/company-zod";
import { ZodBody } from "../common/decorators/zod-decorator";
import { companySchema, updateCompanySchema } from "./schemas/company-zod";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { Roles } from "../common/decorators/roles.decorators";
import { Role } from "../common/enums/roles.enums";
import { Permissions } from "../common/decorators/permissons.decorators";
import { PERMISSIONS } from "../common/enums/permissions.enums";
import { CurrentUser } from "../common/decorators/user.decorators";

@Controller("company")
export class CompanyController {
    constructor(private readonly companyService: CompanyService) { }
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
    @Permissions(PERMISSIONS.company.CREATE)
    async create(@ZodBody(companySchema) data: CompanyDto, @CurrentUser() user: any) {
        return this.companyService.create(data, user)
    }
    @Put(":id")
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
    @Permissions(PERMISSIONS.company.UPDATE)
    async update(@ZodBody(updateCompanySchema) data: UpdateCompanyDto, @Param("id") id: string, @CurrentUser() user: any) {
        return this.companyService.update(data, id, user)
    }
    @Delete(":id")
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
    @Permissions(PERMISSIONS.company.DELETE)
    async delete(@Param("id") id: string, @CurrentUser() user: any) {
        return this.companyService.delete(id, user)
    }
    @Get()
    async findAll() {
        return this.companyService.findAll()
    }
    @Get(":id")
    async findById(@Param("id") id: string) {
        return this.companyService.findById(id)
    }
}