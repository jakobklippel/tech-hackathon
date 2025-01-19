import { Module } from '@nestjs/common';
import {AgentClientService} from "./agent-client.service";
import {AgentController} from "./agent.controller";
import {GithubModule} from "../github/github.module";
import {ApifyClientModule} from "../apify-client/apify-client.module";
import { GotohumanModule } from 'src/gotohuman/gotohuman.module';

@Module({
    imports: [
        GithubModule,
        ApifyClientModule,
        GotohumanModule,
    ],
    providers: [AgentClientService],
    exports: [AgentClientService],
    controllers: [AgentController],
})
export class LlmAgentClientModule {}
