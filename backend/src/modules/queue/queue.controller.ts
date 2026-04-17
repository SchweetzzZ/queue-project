import { Controller, Post, Body, Param, Delete, Get, Req, Put } from "@nestjs/common";
import { QueueService } from "./queue.service";
import type { QueueCreateDto, QueueUpdateDto } from "./schemas/queue-zod"
import { CurrentUser } from "../common/decorators/user.decorators";

@Controller("queue")
export class QueueController {
    constructor(private readonly queueService: QueueService) { }
    @Post()
    async create(@Body() data: QueueCreateDto, @CurrentUser() user: any) {
        return this.queueService.create(data, user.companyId)
    }
    @Put(":id")
    async update(@Body() data: QueueUpdateDto, @Param("id") id: string, @CurrentUser() user: any) {
        return this.queueService.update(data, id, user.companyId)
    }
    @Delete(":id")
    async delete(@Param("id") id: string, @CurrentUser() user: any) {
        return this.queueService.delete(id, user.companyId)
    }
    @Get(":id")
    async findOne(@Param("id") id: string, @CurrentUser() user: any) {
        return this.queueService.findOne(id, user.companyId)
    }
    @Get()
    async findAll(@CurrentUser() user: any) {
        return this.queueService.findAll(user.companyId)
    }
}