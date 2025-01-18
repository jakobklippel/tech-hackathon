import {Body, Controller, Get, Post, Query} from '@nestjs/common';
import {AgentClientService} from "./agent-client.service";

@Controller('llm')
export class AgentController {
    constructor(private readonly agentClientService: AgentClientService) {}

    @Post('prompt')
    async runPrompt(
        @Body() body
    ) {
        return this.agentClientService.generateText(body.message);
    }

}
