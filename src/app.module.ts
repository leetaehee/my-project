import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';

@Module({
  controllers: [AppController],
  providers: [],
  imports: [UsersModule],
})
export class AppModule {}
