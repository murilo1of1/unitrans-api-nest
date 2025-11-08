import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Auth Empresa E2E Tests', () => {
  let app: INestApplication;
  let testEmail: string;

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

    testEmail = `auth-empresa-${Date.now()}@test.com`;
    const testCnpj = `${Date.now()}`.slice(0, 14).padEnd(14, '0'); // CNPJ único baseado em timestamp
    await request(app.getHttpServer()).post('/empresas').send({
      nome: 'Auth Empresa Test',
      email: testEmail,
      cnpj: testCnpj,
      senha: 'senha123',
      tipoVinculo: 'ambos',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login-empresa - Login de Empresa', () => {
    it('deve fazer login com credenciais válidas', () => {
      return request(app.getHttpServer())
        .post('/auth/login-empresa')
        .send({
          email: testEmail,
          senha: 'senha123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBe('Sucesso');
          expect(res.body.response).toBeDefined();
          expect(typeof res.body.response).toBe('string');
        });
    });

    it('deve retornar erro 400 com email inválido', () => {
      return request(app.getHttpServer())
        .post('/auth/login-empresa')
        .send({
          email: 'nao-existe@test.com',
          senha: 'senha123',
        })
        .expect(400);
    });

    it('deve retornar erro 401 com senha incorreta', () => {
      return request(app.getHttpServer())
        .post('/auth/login-empresa')
        .send({
          email: testEmail,
          senha: 'senhaErrada',
        })
        .expect(401);
    });

    it('deve retornar erro 400 quando campos estão vazios', () => {
      return request(app.getHttpServer())
        .post('/auth/login-empresa')
        .send({})
        .expect(400);
    });
  });

  describe('POST /auth/forgot-password - Esqueci a Senha (Empresa)', () => {
    it('deve enviar email de recuperação', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: testEmail,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toContain('e-mail');
        });
    });

    it('deve retornar mesma mensagem para email não existente', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: 'nao-existe@test.com',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toContain('e-mail');
        });
    });
  });

  describe('POST /auth/reset-password - Redefinir Senha (Empresa)', () => {
    it('deve retornar erro quando token é inválido', () => {
      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: 'token-invalido',
          newPassword: 'novaSenha123',
        })
        .expect(400);
    });
  });
});
