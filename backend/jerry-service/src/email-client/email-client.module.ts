import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import {EmailCronService} from "./services/email-cron.service";

@Module({
    imports: [ScheduleModule.forRoot()],
    providers: [EmailCronService],
})
export class EmailClientModule {

}
