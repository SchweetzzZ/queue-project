import { Injectable } from "@nestjs/common"
import { PrismaService } from "src/prisma/prisma.service";
import type { CustomerCreateDto, UpdateCustomerDto } from "./schemas/customers-zod";

@Injectable()
export class CustomersService {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: CustomerCreateDto, companyId: string) {
        const customer = await this.prisma.customer.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                company: {
                    connect: {
                        id: companyId
                    }
                }
            }
        })
    }
    async update(data: UpdateCustomerDto, id: string, companyId: string) {
        const customer = await this.prisma.customer.update({
            where: { id, companyId },
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone
            }
        })
        return customer
    }
    async delete(id: string, companyId: string) {
        const customer = await this.prisma.customer.delete({
            where: { id, companyId }
        })
        return customer
    }
    async findOne(id: string, companyId: string) {
        const customer = await this.prisma.customer.findUnique({
            where: { id, companyId }
        })
        return customer
    }
    async findAll(companyId: string) {
        const customers = await this.prisma.customer.findMany({
            where: { companyId }
        })
        return customers
    }
}