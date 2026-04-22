import { Module } from "@nestjs/common";
import { QueueEntryService } from "./queueEntry.service";
import { QueueEntryController } from "./queueEntry.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { RedisModule } from "../redis/redis.module";

@Module({
    imports: [PrismaModule, RedisModule],
    controllers: [QueueEntryController],
    providers: [QueueEntryService],
    exports: [QueueEntryService],
})
export class QueueEntryModule { }