import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    private readonly logger = new Logger('ProductsService');

    async onModuleInit() {
        this.logger.log('Auth Database connected');
        await this.$connect();
    }
}