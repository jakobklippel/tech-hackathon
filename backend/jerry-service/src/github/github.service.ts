import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import {ConfigService} from "@nestjs/config";

@Injectable()
export class GithubService {
    private readonly baseUrl = 'https://api.github.com';

    constructor(
        private readonly httpService: HttpService,
        private configService: ConfigService
    ) {}

    extractOwnerAndProject(url: string): { owner: string; repo: string } | null {
        const regex = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)$/;
        const match = url.match(regex);

        if (match) {
            const [, owner, repo] = match;
            return { owner, repo };
        }

        return null;
    }

    async getRepoContents(owner: string, repo: string, path = '') {
        const url = `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`;
        const token = this.configService.get<string>('GITHUB_TOKEN');

        const headers = token
            ? { Authorization: `Bearer ${token}` }
            : undefined;

        const response$ = this.httpService.get(url, { headers });
        const response = await lastValueFrom(response$);

        return response.data;
    }

    async getRepoFileStructure(
        owner: string,
        repo: string,
        path = '',
    ): Promise<any> {
        const contents = await this.getRepoContents(owner, repo, path);
        const structure = {};

        for (const item of contents) {
            if (item.type === 'file') {
                structure[item.name] = 'file';
            } else if (item.type === 'dir') {
                structure[item.name] = await this.getRepoFileStructure(
                    owner,
                    repo,
                    item.path,
                );
            }
        }

        return structure; //this.reformatFolderStructure(structure);
    }
}
