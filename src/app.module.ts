import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { EmailService } from './email/email.service';

@Module({
  controllers: [AppController, UsersController],
  providers: [UsersService, EmailService],
})
export class AppModule {}
