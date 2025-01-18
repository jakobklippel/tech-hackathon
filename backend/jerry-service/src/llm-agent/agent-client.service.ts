import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { ConfigService } from "@nestjs/config";
import {GithubService} from "../github/github.service";
import {ApifyClientService} from "../apify-client/apify-client.service";
import {OnEvent} from "@nestjs/event-emitter";

@Injectable()
export class AgentClientService {
    private readonly client: OpenAI;

    constructor(
        private readonly configService: ConfigService,
        private readonly githubService: GithubService,
        private readonly apifyClientService: ApifyClientService,
    ) {
        const token = this.configService.get<string>('OPENAI_KEY');
        this.client = new OpenAI({
            // baseURL: 'https://api.mistral.ai/v1',
            apiKey: token,
        });
    }

    // todo: fine tune the main prompt:
    systemPrompt = `Your task is to:
1. find out whether this project uses OpenAI
2. create a short, concise summary of the loom video

Respond using this markup template:
\`\`\`md
# Review

## Does it use OpenAI?
answer with yes or no. Do not add anything else

## Video summary
the summary of the video

## Closing Remarks
anything you would like to add
\`\`\`

Use function calls to get the required information.
`;

    async generateText(emailContent: string): Promise<string> {

        const context: any[] = [];

        let i=0;
        while (true) {
            i++;
            if (i > 10) {
                break;
            }

            const messages = [
                { role: 'system', content: this.systemPrompt },
                { role: 'user', content: emailContent },
                ...context,
            ];

            console.log(messages);

            const chatCompletion = await this.client.chat.completions.create({
                messages,
                tools: [{
                    "type": "function",
                    "function": {
                        "name": "retrieve_github_repo_file_structure",
                        "description": "Get the file structure of a github repository",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "github_url": {
                                    "type": "string",
                                    "description": "The url of the github repository.",
                                }
                            },
                            "required": ["github_url"],
                        },
                    },
                },{
                    "type": "function",
                    "function": {
                        "name": "retrieve_github_file_content",
                        "description": "Get the content of a specific file in a github repository",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "github_url": {
                                    "type": "string",
                                    "description": "The url of the github repository.",
                                },
                                "file_path": {
                                    "type": "string",
                                    "description": "The path to the file in the github repo.",
                                }
                            },
                            "required": ["github_url", "file_path"],
                        },
                    },
                },{
                    "type": "function",
                    "function": {
                        "name": "retrieve_loom_video_transcript",
                        "description": "Get the transcript of a loom video",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "loom_video_url": {
                                    "type": "string",
                                    "description": "The url of the loom video.",
                                },
                            },
                            "required": ["loom_video_url"],
                        },
                    },
                }],
                // model: "mistral-tiny",
                model: "gpt-4o",
            });



            const toolCall = chatCompletion.choices[0].message.tool_calls?.[0];

            if (toolCall) {
                const functionName = toolCall.function.name;
                const args = JSON.parse(toolCall.function.arguments);

                console.log(functionName);
                switch (functionName) {
                    case 'retrieve_github_repo_file_structure':
                        const {owner, repo} = this.githubService.extractOwnerAndProject(args['github_url'])
                        const githubStructure = await this.githubService.getRepoFileStructure(owner, repo);

                        context.push(
                            {
                                role: 'user',
                                content: `Github repo structure of ${args['github_url']}\n\`\`\`${JSON.stringify(githubStructure)}\`\`\``,
                            }
                        );
                        break;
                    case 'retrieve_github_file_content':
                        const options2 = this.githubService.extractOwnerAndProject(args['github_url'])
                        const fileContent = await this.githubService.getRepoContents(options2.owner, options2.repo, args['file_path']);

                        if (fileContent?.content) {
                            const decodedContent = Buffer.from(fileContent.content, 'base64').toString('utf-8');
                            context.push(
                                {
                                    role: 'user',
                                    content: `File Content of path: ${args['file_path']}\n\`\`\`${decodedContent}\`\`\``,
                                }
                            );
                        }

                        break;
                    case 'retrieve_loom_video_transcript':
                        const loomUrl = args['loom_video_url'];
                        const transcript = await this.apifyClientService.fetchLoomTranscript(loomUrl);

                        context.push(
                            {
                                role: 'user',
                                content: `This is the video transcript:\n\`\`\`${transcript}\`\`\``,
                            }
                        );
                        break;
                }
            } else {
                return chatCompletion.choices[0].message.content;
            }
        }

        return 'what?'
    }

    @OnEvent('email.received')
    async handleUserCreatedEvent(event: { from: string; subject: string; body: string; }) {
        const result = await this.generateText(event.body);
        console.log(result);

        // todo: send the result to frontend
    }
}
