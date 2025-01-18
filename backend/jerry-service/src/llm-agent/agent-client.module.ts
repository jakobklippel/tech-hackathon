import { Module } from '@nestjs/common';
import {AgentClientService} from "./agent-client.service";
import {AgentController} from "./agent.controller";
import {GithubModule} from "../github/github.module";

@Module({
    imports: [
        GithubModule,
    ],
    providers: [AgentClientService],
    exports: [AgentClientService],
    controllers: [AgentController],
})
export class LlmAgentClientModule {}
