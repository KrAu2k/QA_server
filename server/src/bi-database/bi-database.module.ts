import { Module } from '@nestjs/common';
import { BiDatabaseService } from './bi-database.service';
import { BiDatabaseController } from './bi-database.controller';

@Module({
  providers: [BiDatabaseService],
  controllers: [BiDatabaseController],
  exports: [BiDatabaseService],
})
export class BiDatabaseModule {}
