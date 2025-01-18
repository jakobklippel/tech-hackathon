import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailClientModule } from './email-client/email-client.module';
import { GithubModule } from './github/github.module';
import {ConfigModule} from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the configuration globally available
    }),
    EmailClientModule,
    GithubModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
