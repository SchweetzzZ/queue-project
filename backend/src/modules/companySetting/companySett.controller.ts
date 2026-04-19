import { Controller, Put, Param, Body, UseGuards, Get } from "@nestjs/common";
import { CompanySettingService } from "./companySett.service";
import type { UpdateCompanySettingDto } from "./schemas/companySett-zod";
import { RolesGuard } from "src/modules/common/guards/roles.guard";
import { PermissionsGuard } from "src/modules/common/guards/permissions.guard";
import { Roles } from "src/modules/common/decorators/roles.decorators";
import { Permissions } from "src/modules/common/decorators/permissons.decorators";
import { Role } from "src/modules/common/enums/roles.enums";
import { PERMISSIONS } from "src/modules/common/enums/permissions.enums";
import { JwtAuthGuard } from "src/modules/common/guards/jwt-auth.guard";

@Controller("company-setting")
export class CompanySettingController {
    constructor(private readonly companySettingService: CompanySettingService) { }
    @Put(":companyId")
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Roles(Role.SUPER_ADMIN)
    @Permissions(PERMISSIONS.companySetting.UPDATE)
    async update(@Body() data: UpdateCompanySettingDto, @Param("companyId") companyId: string) {
        return this.companySettingService.update(data, companyId)
    }
    @Get(":companyId")
    async findByCompanyId(@Param("companyId") companyId: string) {
        return this.companySettingService.findByCompanyId(companyId)
    }
}