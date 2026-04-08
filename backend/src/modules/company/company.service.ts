import { ConflictException, Injectable } from "@nestjs/common"
import { PrismaService } from "src/prisma/prisma.service";
import { CompanyDto, UpdateCompanyDto } from "./schemas/company-zod";
@Injectable()
export class CompanyService {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: CompanyDto, superAdminId: string) {
        try {
            const createCompany = await this.prisma.company.create({
                data: {
                    name: data.name,
                    isActive: data.isActive,

                    settings: {
                        create: {
                            customerLabel: 'Cliente',
                            agentLabel: 'Atendente',
                            queueLabel: 'Fila',
                        }
                    }
                },
                include: {
                    settings: true
                }
            })
            return createCompany
        } catch (error) {
            throw new ConflictException("Company already exists")
        }
    }
    async update(data: UpdateCompanyDto, id: string, superAdminId: string) {
        try {
            const verifyCompany = await this.prisma.company.findUnique({
                where: { id }
            })
            if (!verifyCompany) {
                throw new Error("Company not found")
            }
            const updateCompany = await this.prisma.company.update({
                where: { id },
                data: {
                    name: data.name,
                    plan: data.plan,
                    isActive: data.isActive,
                }
            })
            return updateCompany
        } catch (error) {
            throw new ConflictException("Company already exists")
        }
    }
    async delete(id: string, superAdminId: string) {
        try {
            const verifyCompany = await this.prisma.company.findUnique({
                where: { id }
            })
            if (!verifyCompany) {
                throw new Error("Company not found")
            }
            const deleteCompany = await this.prisma.company.delete({
                where: { id }
            })
            return deleteCompany
        } catch (error) {
            throw new ConflictException("Company already exists")
        }
    }
    async findAll() {
        const companies = await this.prisma.company.findMany()
        return companies
    }
    async findById(id: string) {
        const company = await this.prisma.company.findUnique({
            where: { id }
        })
        return company
    }
}