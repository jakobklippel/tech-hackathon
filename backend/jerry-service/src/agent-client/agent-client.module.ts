import { Module } from '@nestjs/common';
import {AgentClientService} from "./agent-client.service";
import {HttpModule} from "@nestjs/axios";

@Module({
    imports: [HttpModule],
    providers: [AgentClientService],
    exports: [AgentClientService],
})
export class AgentClientModule {}
