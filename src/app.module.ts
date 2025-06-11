import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [AuthModule, PrismaModule, UsersModule, RolesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
