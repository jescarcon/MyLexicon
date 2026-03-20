import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entry } from './entities/entry.entity';
import { EntryController } from './entry.controller';
import { EntryService } from './entry.service';
import { Dictionary } from '../dictionary/entities/dictionary.entity';
import { DictionaryModule } from '../dictionary/dictionary.module';


@Module({
  imports: [TypeOrmModule.forFeature([Entry, Dictionary]),
    DictionaryModule
  ],
  controllers: [EntryController],
  providers: [EntryService],
  exports: [EntryService],
})
export class EntryModule { }
