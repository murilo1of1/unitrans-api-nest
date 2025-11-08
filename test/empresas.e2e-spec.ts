import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Empresas E2E Tests', () => {
  let app: INestApplication;
  let empresaId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /empresas - Criar Empresa', () => {
    it('deve criar uma nova empresa', () => {
      return request(app.getHttpServer())
        .post('/empresas')
        .send({
          nome: 'Empresa Teste E2E',
          email: `empresa-e2e-${Date.now()}@test.com`,
          cnpj: '12345678000190',
          senha: 'senha123',
          tipoVinculo: 'ambos',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBe('Criado com sucesso!');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.nome).toBe('Empresa Teste E2E');
          empresaId = res.body.data.id;
        });
    });

    it('deve retornar erro 400 quando email é inválido', () => {
      return request(app.getHttpServer())
        .post('/empresas')
        .send({
          nome: 'Empresa',
          email: 'email-invalido',
          cnpj: '12345678000190',
          senha: 'senha123',
          tipoVinculo: 'ambos',
        })
        .expect(400);
    });

    it('deve retornar erro 400 quando senha é muito curta', () => {
      return request(app.getHttpServer())
        .post('/empresas')
        .send({
          nome: 'Empresa',
          email: 'empresa@test.com',
          cnpj: '12345678000190',
          senha: '123',
          tipoVinculo: 'ambos',
        })
        .expect(400);
    });

    it('deve retornar erro 400 quando tipoVinculo é inválido', () => {
      return request(app.getHttpServer())
        .post('/empresas')
        .send({
          nome: 'Empresa',
          email: 'empresa@test.com',
          cnpj: '12345678000190',
          senha: 'senha123',
          tipoVinculo: 'invalido',
        })
        .expect(400);
    });
  });

  describe('GET /empresas - Listar Empresas', () => {
    it('deve retornar lista de empresas filtradas por tipoVinculo', () => {
      return request(app.getHttpServer())
        .get('/empresas')
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Dados encontrados');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('GET /empresas/:id - Buscar Empresa por ID', () => {
    it('deve retornar uma empresa específica', () => {
      return request(app.getHttpServer())
        .get(`/empresas/${empresaId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Dados encontrados');
          expect(res.body.data.id).toBe(empresaId);
        });
    });

    it('deve retornar 404 quando empresa não existe', () => {
      return request(app.getHttpServer()).get('/empresas/99999').expect(404);
    });
  });

  describe('PATCH /empresas/:id - Atualizar Empresa', () => {
    it('deve atualizar uma empresa', () => {
      return request(app.getHttpServer())
        .patch(`/empresas/${empresaId}`)
        .send({
          nome: 'Empresa Atualizada E2E',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Atualizado com sucesso!');
          expect(res.body.data.nome).toBe('Empresa Atualizada E2E');
        });
    });
  });

  describe('DELETE /empresas/:id - Deletar Empresa', () => {
    it('deve deletar uma empresa', () => {
      return request(app.getHttpServer())
        .delete(`/empresas/${empresaId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Registro excluído');
        });
    });
  });
});
