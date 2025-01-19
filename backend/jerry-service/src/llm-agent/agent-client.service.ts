import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { ConfigService } from "@nestjs/config";
import { GithubService } from "../github/github.service";
import { ApifyClientService } from "../apify-client/apify-client.service";
import { GotohumanService } from 'src/gotohuman/gotohuman.service';
import { OnEvent } from "@nestjs/event-emitter";
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AgentClientService {
    private readonly client: OpenAI;
    private readonly systemPrompt: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly githubService: GithubService,
        private readonly gotohumanService: GotohumanService,
        private readonly apifyClientService: ApifyClientService,
    ) {
        const token = this.configService.get<string>('MISTRAL_KEY');
        this.client = new OpenAI({
            baseURL: 'https://api.mistral.ai/v1',
            apiKey: token,
        });

        const promptPath = path.join(process.cwd(), "..", "..", 'agent-prompt.md');
        this.systemPrompt = fs.readFileSync(promptPath, 'utf-8');
    }

    async generateText(emailContent: string): Promise<string> {

        const context: any[] = [];

        let i = 0;
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
                }, {
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
                }, {
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
                model: "mistral-large-latest",
                temperature: 0.1,
                //model: "gpt-4o",
            });



            const toolCall = chatCompletion.choices[0].message.tool_calls?.[0];

            if (toolCall) {
                const functionName = toolCall.function.name;
                const args = JSON.parse(toolCall.function.arguments);

                console.log(functionName);
                switch (functionName) {
                    case 'retrieve_github_repo_file_structure':
                        const { owner, repo } = this.githubService.extractOwnerAndProject(args['github_url'])
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
                return chatCompletion.choices[0].message.content.replace('```', '').trim();
            }
        }

        return 'what?'
    }

    generateRandomString(): string {
        const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < 5; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters[randomIndex];
        }
        return result;
    }

    @OnEvent('email.received')
    async handleUserCreatedEvent(event: { from: string; subject: string; body: string; }) {
      const agentId = 'jerryAgent'
        const randomRunId = this.generateRandomString();
        await this.gotohumanService.announceRun(agentId, randomRunId, event.from);
 
        const result = await this.generateText(event.body);
        await this.gotohumanService.sendResult(agentId, randomRunId, event.from, result);
    }
}
