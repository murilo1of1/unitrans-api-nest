import { Module, ValidationPipe, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AlunosModule } from './modules/alunos/alunos.module';
import { EmpresasModule } from './modules/empresas/empresas.module';
import { AuthModule } from './modules/auth/auth.module';
import { PontosModule } from './modules/pontos/pontos.module';
import { RotasModule } from './modules/rotas/rotas.module';
import { VinculosModule } from './modules/vinculos/vinculos.module';
import { Aluno } from './modules/alunos/entities/aluno.entity';
import { Empresa } from './modules/empresas/entities/empresa.entity';
import { DatabaseSeeder } from './common/seeders/database.seeder';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USERNAME,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    }),
    TypeOrmModule.forFeature([Aluno, Empresa]), // Para o seeder
    AuthModule,
    AlunosModule,
    EmpresasModule,
    PontosModule,
    RotasModule,
    VinculosModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DatabaseSeeder,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly seeder: DatabaseSeeder) {}

  async onModuleInit() {
    await this.seeder.seed();
  }
}
