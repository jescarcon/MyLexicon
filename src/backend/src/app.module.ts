import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import jwtConfig from './modules/auth/jwt.config';
import { AuthModule } from './modules/auth/auth.module';
import { DictionaryModule } from './modules/dictionary/dictionary.module';
import { EntryModule } from './modules/entry/entry.module';

@Module({
  imports: [
    //env global
    ConfigModule.forRoot({
      isGlobal: true, 
      load:[jwtConfig],
    }),

    // TypeORM + PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST'),
          port: Number(config.get('DB_PORT')),
          username: config.get<string>('DB_USERNAME'),
          password:config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
          autoLoadEntities: true,
          synchronize: true, // only on develop
        };
      },
    }),

    UserModule,AuthModule,DictionaryModule,EntryModule
  ],
})
export class AppModule {}
