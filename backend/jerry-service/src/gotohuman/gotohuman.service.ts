import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {ConfigService} from "@nestjs/config";

@Injectable()
export class GotohumanService {
    private readonly baseUrl = 'https://api.gotohuman.com';

    constructor(
        private readonly httpService: HttpService,
        private configService: ConfigService
    ) {}
    
    async announceRun(
      workflowId: string,
      workflowRunId: string,
      from: string,
    ): Promise<any> {
        const gotohumanKey = this.configService.get<string>('GOTOHUMAN_KEY');
        if (!gotohumanKey) {
            throw new Error('gotoHuman token is not configured');
        }

        const url = `${this.baseUrl}/reportWorkflowState`;

        const response = await this.httpService
            .post(
                url,
                {
                  "workflowId": workflowId,
                  "workflowName": "Jerry Pitch Assistant",
                  "workflowRunId": workflowRunId,
                  "taskName": `New submission from ${from}`,
                  "state": "task_running"
                },
                {
                    headers: {
                        'x-api-key': `${gotohumanKey}`,
                        'Content-Type': 'application/json',
                    },
                },
            )
            .toPromise();

        return response.data;
    }

    
    async sendResult(
        workflowId: string,
        workflowRunId: string,
        from: string,
        content: string,
    ): Promise<any> {
        const gotohumanKey = this.configService.get<string>('GOTOHUMAN_KEY');
        const gotohumanFormId = this.configService.get<string>('GOTOHUMAN_FORM_ID');
        if (!gotohumanKey || !gotohumanFormId) {
            throw new Error('gotoHuman token or form id is not configured');
        }

        const url = `${this.baseUrl}/requestReview`;

        const response = await this.httpService
            .post(
                url,
                {
                  workflowId: workflowId,
                  workflowRunId: workflowRunId,
                  formId: gotohumanFormId,
                  fields: {
                      "email": from,
                      "markdown": content,
                  },
              },
                {
                    headers: {
                        'x-api-key': `${gotohumanKey}`,
                        'Content-Type': 'application/json',
                    },
                },
            )
            .toPromise();

        return response.data;
    }
}
