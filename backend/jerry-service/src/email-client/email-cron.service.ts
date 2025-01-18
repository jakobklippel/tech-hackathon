import { Injectable, Logger } from '@nestjs/common';
import * as Imap from 'imap-simple';
import {ConfigService} from "@nestjs/config";

@Injectable()
export class EmailCronService {
    private readonly logger = new Logger(EmailCronService.name);

    constructor(private configService: ConfigService) {}

    private imapConfig = {
        imap: {
            user: 'hackathon@config.one',
            host: 'imap.mailbox.org',
            port: 993,
            tls: true,
            tlsOptions: {
                rejectUnauthorized: false,
            },
            authTimeout: 3000,
        },
    };

    // @Cron(CronExpression.EVERY_10_SECONDS)
    async fetchEmails() {
        try {

            const pass = this.configService.get<string>('EMAIL_PASSWORD');

            const connection = await Imap.connect({
                imap: {
                    ...this.imapConfig.imap,
                    password: pass
                }
            });
            this.logger.log('Connected to IMAP server');

            await connection.openBox('INBOX');

            const searchCriteria = ['ALL'];
            const fetchOptions = {
                bodies: ['HEADER', 'TEXT'],
                markSeen: true,
            };

            const messages = await connection.search(searchCriteria, fetchOptions);

            if (messages.length === 0) {
                this.logger.log('No new emails found');
            } else {
                const message = messages[0];

                const allHeaders = message.parts.find((part) => part.which === 'HEADER');
                const allBody = message.parts.find((part) => part.which === 'TEXT');
                const subject = allHeaders?.body?.subject?.[0];
                const from = allHeaders?.body?.from?.[0];
                const body = allBody?.body;

                this.logger.log(`Email received from ${from}: ${subject}`);
                this.logger.debug(`Email body: ${body}`);

                await connection.addFlags([message.attributes.uid], '\\Deleted');
                this.logger.log(`Marked message UID ${message.attributes.uid} for deletion`);

                connection.imap.expunge((err) => {
                    if (err) {
                        this.logger.error('Failed to expunge emails', err.message);
                    } else {
                        this.logger.log('Successfully expunged deleted emails');
                    }
                });
            }

            connection.end();
        } catch (error) {
            this.logger.error('Failed to fetch emails', error.message);
        }
    }
}
