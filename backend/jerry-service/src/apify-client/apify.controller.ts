import { Controller, Get, Query } from '@nestjs/common';
import {ApifyClientService} from "./apify-client.service";

@Controller('apify')
export class ApifyController {
    constructor(private readonly apifyService: ApifyClientService) {}

    @Get('transcript')
    async getRepoContents(
        @Query('url') url: string,
    ) {
        return this.apifyService.fetchLoomTranscript(url);
    }

}
