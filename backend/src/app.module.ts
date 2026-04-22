import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CompanyModule } from './modules/company/company.module';
import { ConfigModule } from '@nestjs/config';
import { CompanySettingModule } from './modules/companySetting/companySett.module';
import { AgentModule } from './modules/agent/agent.module';
import { QueueModule } from './modules/queue/queue.module';
import { CustomersModule } from './modules/customers/customers.module';
import { QueueEntryModule } from './modules/queueEntry/queueEntry.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    CompanyModule,
    CompanySettingModule,
    AgentModule,
    QueueModule,
    CustomersModule,
    QueueEntryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
