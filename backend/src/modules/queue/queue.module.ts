import { Module } from "@nestjs/common";
import { QueueService } from "./queue.service";
import { QueueController } from "./queue.controller";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
    controllers: [QueueController],
    providers: [QueueService, PrismaService],
    exports: [QueueService]
})
export class QueueModule { }