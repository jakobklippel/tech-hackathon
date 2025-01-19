import { Injectable, Logger } from '@nestjs/common';
import { ApifyClient } from 'apify-client';
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ApifyClientService {
    private readonly logger = new Logger(ApifyClientService.name);

    private client: ApifyClient;

    constructor(private configService: ConfigService) {
        const token = this.configService.get<string>('APIFY_TOKEN');

        this.client = new ApifyClient({
            token: token
        });
    }

    mock = 'Hi, I\'m Sam from the loom team. And I\'m going to show you how to use async video to record a product demo.\n' +
        'What you\'re about to see as an example for my colleague Connor, he filmed a walkthrough for a new product to show to his team.\n' +
        'Here it is. Hey, what\'s up guys, quick demo for a, an updated page that we had. So in the past, if you tried to accept the workspace invite from an email that you were not liking, as all the Uganda was, this little blurb here basically says, here\'s the email you\'re logged in as, but it should be for this one, you\'ll figure it out, right?\n' +
        'No way to actually do anything about it, which is a dead end in the product. And a little bit of a frustrating like end result.\n' +
        'Understandably, we got this I\'m not mad. I\'m just disappointed tweet from Dolores, for Westworld, which it\'s maybe the most soul crushing tone we could have gotten.\n' +
        'So obviously we had to do something about it. And I\'ll do that right here. So say that I am logged in as whoops.\n' +
        'See, I\'m logged in as use myself. I have give me a sec seamless anyways. So say that I want to invite like a modern plus like 60 live.com to join my workspace.\n' +
        'So I send that email and invite and I go on, I get it at my normal, you know? Okay. So now I\'m logged in as Connor, but I\'m trying to accept the invite for Connor plus 60.\n' +
        'So if I click join this workspace, instead of the texts, it gives me this beautiful page brought to you by our design team where it tells me the email I\'m like then as the workspace and what I should be logged in as, so now when I click this button it signs me out.\n' +
        'And then it also, auto-populates the email field for creating an account because this is a loom.com. It knows it\'s FSL.\n' +
        'So it\'ll try to use Okta, but otherwise, what this will do is like walking through the, create your account step, or like the copy will reflect that on.\n' +
        'So this is awesome. Yeah. This is just so much better away of like, not frustrating our users and reducing a ton of friction because like you don\'t just hit a dead end in the maze, right?\n' +
        'Like it actually prompts you to keep going. And we get like a decent amount of these errors every day. So hoping that this will have a meaningful impact.\n';

    async fetchLoomTranscript(url: string): Promise<any> {

        return this.mock; // remove this for real call

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

            return items?.[0]?.['transcript'];
        } catch (error) {
            this.logger.error('Error fetching Loom transcript', error.stack);
            throw error;
        }
    }
}
