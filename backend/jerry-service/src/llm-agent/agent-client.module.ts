import { Module } from '@nestjs/common';
import {AgentClientService} from "./agent-client.service";
import {AgentController} from "./agent.controller";
import {GithubModule} from "../github/github.module";
import {ApifyClientModule} from "../apify-client/apify-client.module";

@Module({
    imports: [
        GithubModule,
        ApifyClientModule,
    ],
    providers: [AgentClientService],
    exports: [AgentClientService],
    controllers: [AgentController],
})
export class LlmAgentClientModule {}
