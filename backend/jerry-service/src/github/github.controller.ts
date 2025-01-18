import { Controller, Get, Query } from '@nestjs/common';
import { GithubService } from './github.service';

@Controller('github')
export class GithubController {
    constructor(private readonly githubService: GithubService) {}

    extractOwnerAndProject(url: string): { owner: string; repo: string } | null {
        const regex = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)$/;
        const match = url.match(regex);

        if (match) {
            const [, owner, repo] = match;
            return { owner, repo };
        }

        return null;
    }

    @Get('file')
    async getRepoContents(
        @Query('url') url: string,
        @Query('path') path = '',
    ) {
        const {owner, repo} = this.extractOwnerAndProject(url)
        const data = await this.githubService.getRepoContents(owner, repo, path);

        if (data?.content) {
            const decodedContent = Buffer.from(data.content, 'base64').toString('utf-8');
            return decodedContent;
        }

        return null;
    }

    @Get('structure')
    async getRepoStructure(
        @Query('url') url: string,
        @Query('path') path = '',
    ) {
        const {owner, repo} = this.extractOwnerAndProject(url)
        return this.githubService.getRepoFileStructure(owner, repo, path);
    }
}
