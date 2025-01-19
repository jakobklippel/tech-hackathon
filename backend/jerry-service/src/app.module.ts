import { Module } from '@nestjs/common';
import { EmailClientModule } from './email-client/email-client.module';
import { GithubModule } from './github/github.module';
import {ConfigModule} from "@nestjs/config";
import {AgentClientModule} from "./agent-client/agent-client.module";
import {ApifyClientModule} from "./apify-client/apify-client.module";
import {GotohumanModule} from "./gotohuman/gotohuman.module";
import {LlmAgentClientModule} from "./llm-agent/agent-client.module";
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the configuration globally available
    }),
    EventEmitterModule.forRoot(),
    EmailClientModule,
    GithubModule,
    AgentClientModule,
    ApifyClientModule,
    GotohumanModule,
    LlmAgentClientModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
