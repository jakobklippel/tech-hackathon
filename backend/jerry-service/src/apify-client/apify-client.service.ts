import { Injectable, Logger } from '@nestjs/common';
import { ApifyClient } from 'apify-client';
import {ConfigService} from "@nestjs/config";

@Injectable()
export class ApifyClientService {
    private readonly logger = new Logger(ApifyClientService.name);

    private client: ApifyClient;

    constructor(private configService: ConfigService) {
        const token = this.configService.get<string>('APIFY_TOKEN');

        this.client = new ApifyClient({
            token: token// 'apify_api_lhCX6JmyfzWIrZgbLAMax7yd1yCykT0luIma',
        });
    }

    async fetchLoomTranscript(url: string): Promise<any> {
        try {
            const input = {
                startUrls: [
                    {
                        url: url,
                    },
                ],
            };

            const run = await this.client.actor("webtotheflow/get-loom-transcript").call(input);

            this.logger.log('Actor run started');
            this.logger.log(`💾 Check your data here: https://console.apify.com/storage/datasets/${run.defaultDatasetId}`);

            const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
            items.forEach((item) => {
                this.logger.debug(`Item: ${JSON.stringify(item)}`);
            });

            return items;
        } catch (error) {
            this.logger.error('Error fetching Loom transcript', error.stack);
            throw error;
        }
    }
}
