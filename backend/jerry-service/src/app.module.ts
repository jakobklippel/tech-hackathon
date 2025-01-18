import { Module } from '@nestjs/common';
import { EmailClientModule } from './email-client/email-client.module';
import { GithubModule } from './github/github.module';
import {ConfigModule} from "@nestjs/config";
import {AgentClientModule} from "./agent-client/agent-client.module";
import {ApifyClientModule} from "./apify-client/apify-client.module";
import {LlmAgentClientModule} from "./llm-agent/agent-client.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the configuration globally available
    }),
    EmailClientModule,
    GithubModule,
    AgentClientModule,
    ApifyClientModule,
    LlmAgentClientModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
