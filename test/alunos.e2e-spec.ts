import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Alunos E2E Tests', () => {
  let app: INestApplication;
  let alunoId: number;

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

  describe('POST /alunos - Criar Aluno', () => {
    it('deve criar um novo aluno', () => {
      return request(app.getHttpServer())
        .post('/alunos')
        .send({
          nome: 'João Teste E2E',
          email: `teste-e2e-${Date.now()}@test.com`,
          senha: 'senha123',
          cpf: '12345678900',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBe('Criado com sucesso!');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.nome).toBe('João Teste E2E');
          alunoId = res.body.data.id;
        });
    });

    it('deve retornar erro 400 quando email é inválido', () => {
      return request(app.getHttpServer())
        .post('/alunos')
        .send({
          nome: 'João',
          email: 'email-invalido',
          senha: 'senha123',
        })
        .expect(400);
    });

    it('deve retornar erro 400 quando senha é muito curta', () => {
      return request(app.getHttpServer())
        .post('/alunos')
        .send({
          nome: 'João',
          email: 'joao@test.com',
          senha: '123',
        })
        .expect(400);
    });
  });

  describe('GET /alunos - Listar Alunos', () => {
    it('deve retornar lista de alunos', () => {
      return request(app.getHttpServer())
        .get('/alunos')
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Dados encontrados');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('GET /alunos/:id - Buscar Aluno por ID', () => {
    it('deve retornar um aluno específico', () => {
      return request(app.getHttpServer())
        .get(`/alunos/${alunoId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Dados encontrados');
          expect(res.body.data.id).toBe(alunoId);
        });
    });

    it('deve retornar 404 quando aluno não existe', () => {
      return request(app.getHttpServer()).get('/alunos/99999').expect(404);
    });
  });

  describe('PATCH /alunos/:id - Atualizar Aluno', () => {
    it('deve atualizar um aluno', () => {
      return request(app.getHttpServer())
        .patch(`/alunos/${alunoId}`)
        .send({
          nome: 'João Atualizado E2E',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Atualizado com sucesso!');
          expect(res.body.data.nome).toBe('João Atualizado E2E');
        });
    });
  });

  describe('DELETE /alunos/:id - Deletar Aluno', () => {
    it('deve deletar um aluno', () => {
      return request(app.getHttpServer())
        .delete(`/alunos/${alunoId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Registro excluído');
        });
    });
  });
});
