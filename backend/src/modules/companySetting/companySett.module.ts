import { Module } from "@nestjs/common";
import { CompanySettingController } from "./companySett.controller";
import { CompanySettingService } from "./companySett.service";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    controllers: [CompanySettingController],
    providers: [CompanySettingService],
    exports: [CompanySettingService]
})
export class CompanySettingModule { }
