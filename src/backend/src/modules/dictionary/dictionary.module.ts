import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dictionary } from './entities/dictionary.entity';
import { DictionaryController } from './dictionary.controller';
import { DictionaryService } from './dictionary.service';
import { User } from '../user/entities/user.entity';


@Module({
  imports: [TypeOrmModule.forFeature([User, Dictionary])],
  controllers: [DictionaryController],
  providers: [DictionaryService],
  exports: [DictionaryService],
})
export class DictionaryModule {}
