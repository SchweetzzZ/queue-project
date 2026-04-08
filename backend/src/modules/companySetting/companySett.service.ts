import { Injectable, ConflictException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateCompanySettingDto } from "./schemas/companySett-zod";

@Injectable()
export class CompanySettingService {
    constructor(private readonly prisma: PrismaService) { }
    async update(data: UpdateCompanySettingDto, companyId: string,) {
        try {
            const verifyCompany = await this.prisma.company.findUnique({
                where: { id: companyId }
            })
            if (!verifyCompany) {
                throw new Error("Company not found")
            }
            const updateCompanySetting = await this.prisma.companySettings.update({
                where: { companyId },
                data: {
                    customerLabel: data.customerLabel,
                    agentLabel: data.agentLabel,
                    queueLabel: data.queueLabel,
                }
            })
            return updateCompanySetting
        } catch (error) {
            throw new ConflictException("Company setting already exists")
        }
    }
    async findByCompanyId(companyId: string) {
        const verifyCompany = await this.prisma.company.findUnique({
            where: { id: companyId }
        })
        if (!verifyCompany) {
            throw new Error("Company not found")
        }
        const companySetting = await this.prisma.companySettings.findUnique({
            where: { companyId }
        })
        return companySetting
    }
}