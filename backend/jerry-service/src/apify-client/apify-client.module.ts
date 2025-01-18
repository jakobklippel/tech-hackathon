import { Module } from '@nestjs/common';
import {ApifyClientService} from "./apify-client.service";
import {ApifyController} from "./apify.controller";

@Module({
    providers: [ApifyClientService],
    exports: [ApifyClientService],
    controllers: [ApifyController],
})
export class ApifyClientModule {}
