import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { ConfigService } from "@nestjs/config";
import {GithubService} from "../github/github.service";

@Injectable()
export class AgentClientService {
    private readonly client: OpenAI;

    context: any[] = [];

    constructor(
        private readonly configService: ConfigService,
        private readonly githubService: GithubService,
    ) {
        const token = this.configService.get<string>('OPENAI_KEY');
        this.client = new OpenAI({
            // baseURL: 'https://api.mistral.ai/v1',
            apiKey: token,
        });
    }

    async generateText(emailContent: string): Promise<string> {

        let i=0;
        while (true) {
            i++;
            if (i > 10) {
                break;
            }

            const messages = [
                { role: 'system', content: `Your task is to find out whether this project uses OpenAI. Use function calls to get the required information. ` },
                { role: 'user', content: emailContent },
                ...this.context,
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
                },],
                // model: "mistral-tiny",
                model: "gpt-4o",
            });



            const toolCall = chatCompletion.choices[0].message.tool_calls?.[0];

            if (toolCall) {
                const id = toolCall.id;
                const functionName = toolCall.function.name;
                const args = JSON.parse(toolCall.function.arguments);

                switch (functionName) {
                    case 'retrieve_github_repo_file_structure':
                        const {owner, repo} = this.githubService.extractOwnerAndProject(args['github_url'])
                        const githubStructure = await this.githubService.getRepoFileStructure(owner, repo);

                        this.context.push(
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
                            this.context.push(
                                {
                                    role: 'user',
                                    content: `File Content of path: ${args['file_path']}\n\`\`\`${decodedContent}\`\`\``,
                                }
                            );
                        }

                        break;
                }
            } else {
                return chatCompletion.choices[0].message.content;
            }
        }

        return 'what?'
    }
}
