import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { UploadsController } from './uploads/uploads.controller';
import { EmailsService } from './emails/emails.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    AuthModule,
    RegistrationsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
  ],
  controllers: [UploadsController],
  providers: [EmailsService, PrismaService],
})
export class AppModule {}
