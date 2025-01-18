import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AgentClientService {
    constructor(private readonly httpService: HttpService) {}

    async callEndpoint(url: string, method: 'GET' | 'POST' = 'GET', data?: any): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.request({
                    url,
                    method,
                    data,
                }),
            );
            return response.data;
        } catch (error) {
            throw new Error(`HTTP Request failed: ${error.message}`);
        }
    }
}
