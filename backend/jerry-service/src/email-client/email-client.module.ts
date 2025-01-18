import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import {EmailCronService} from "./email-cron.service";
import {AgentClientModule} from "../agent-client/agent-client.module";

@Module({
    imports: [ScheduleModule.forRoot(), AgentClientModule],
    providers: [EmailCronService],
})
export class EmailClientModule {

}
