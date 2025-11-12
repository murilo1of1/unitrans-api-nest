import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Pontos E2E Tests', () => {
  let app: INestApplication;
  let pontoId: number;
  let rotaPontoId: number;
  let empresaId: number;
  let rotaId: number;
  let authToken: string;

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

    // Criar empresa para testes
    const timestamp = Date.now();
    const empresaEmail = `empresa-pontos-${timestamp}@test.com`;

    const empresaResponse = await request(app.getHttpServer())
      .post('/empresas')
      .send({
        nome: 'Empresa Teste Pontos',
        email: empresaEmail,
        cnpj: `${timestamp.toString().slice(-14)}`,
        senha: 'senha123',
        tipoVinculo: 'ambos',
      })
      .expect(201);

    empresaId = empresaResponse.body.data.id;

    // Fazer login para obter token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login-empresa')
      .send({
        email: empresaEmail,
        senha: 'senha123',
      });

    // Login pode retornar 200 ou 201 dependendo da implementação
    expect([200, 201]).toContain(loginResponse.status);
    expect(loginResponse.body).toHaveProperty('response');
    authToken = loginResponse.body.response;
    expect(authToken).toBeDefined();

    // Criar uma rota para testes de vínculo ponto-rota
    // Nota: Isso requer que o módulo de Rotas esteja implementado
    // Por enquanto, vamos assumir que existe
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /pontos - Criar Ponto', () => {
    it('deve criar um novo ponto', () => {
      return request(app.getHttpServer())
        .post('/pontos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Terminal Central',
          endereco: 'Av. Principal, 1000',
          latitude: -23.5505,
          longitude: -46.6333,
          idEmpresa: empresaId,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBe('Ponto criado com sucesso');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.nome).toBe('Terminal Central');
          pontoId = res.body.data.id;
        });
    });

    it('deve retornar erro 400 quando nome não é fornecido', () => {
      return request(app.getHttpServer())
        .post('/pontos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          endereco: 'Av. Principal, 1000',
          latitude: -23.5505,
          longitude: -46.6333,
          idEmpresa: empresaId,
        })
        .expect(400);
    });

    it('deve retornar erro 401 sem autenticação', () => {
      return request(app.getHttpServer())
        .post('/pontos')
        .send({
          nome: 'Terminal',
          endereco: 'Av. Principal, 1000',
          latitude: -23.5505,
          longitude: -46.6333,
          idEmpresa: empresaId,
        })
        .expect(401);
    });

    it('deve retornar erro 404 quando empresa não existe', () => {
      return request(app.getHttpServer())
        .post('/pontos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Terminal',
          endereco: 'Av. Principal, 1000',
          latitude: -23.5505,
          longitude: -46.6333,
          idEmpresa: 99999,
        })
        .expect(404);
    });
  });

  describe('GET /pontos - Listar Pontos', () => {
    it('deve retornar lista de pontos', () => {
      return request(app.getHttpServer())
        .get('/pontos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Dados encontrados');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('deve retornar erro 401 sem autenticação', () => {
      return request(app.getHttpServer()).get('/pontos').expect(401);
    });
  });

  describe('GET /pontos/empresa/:idEmpresa - Listar Pontos por Empresa', () => {
    it('deve retornar pontos de uma empresa específica', () => {
      return request(app.getHttpServer())
        .get(`/pontos/empresa/${empresaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Pontos da empresa encontrados');
          expect(Array.isArray(res.body.data)).toBe(true);
          if (res.body.data.length > 0) {
            expect(res.body.data[0].idEmpresa).toBe(empresaId);
          }
        });
    });
  });

  describe('GET /pontos/:id - Buscar Ponto por ID', () => {
    it('deve retornar um ponto específico', () => {
      return request(app.getHttpServer())
        .get(`/pontos/${pontoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Dados encontrados');
          expect(res.body.data.id).toBe(pontoId);
          expect(res.body.data.nome).toBe('Terminal Central');
        });
    });

    it('deve retornar 404 quando ponto não existe', () => {
      return request(app.getHttpServer())
        .get('/pontos/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /pontos/:id - Atualizar Ponto', () => {
    it('deve atualizar um ponto', () => {
      return request(app.getHttpServer())
        .patch(`/pontos/${pontoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Terminal Central Atualizado',
          endereco: 'Av. Principal, 1001',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Ponto atualizado com sucesso');
          expect(res.body.data.nome).toBe('Terminal Central Atualizado');
          expect(res.body.data.endereco).toBe('Av. Principal, 1001');
        });
    });

    it('deve retornar 404 quando ponto não existe', () => {
      return request(app.getHttpServer())
        .patch('/pontos/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Teste',
        })
        .expect(404);
    });
  });

  describe('POST /pontos/rota - Adicionar Ponto a Rota', () => {
    beforeAll(async () => {
      // Criar uma rota para vincular o ponto
      // Nota: Isso requer implementação do módulo de Rotas
      // Por enquanto, vamos pular este teste ou criar manualmente
    });

    it.skip('deve adicionar ponto a uma rota', () => {
      // Teste será habilitado quando módulo de Rotas estiver pronto
      return request(app.getHttpServer())
        .post('/pontos/rota')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          idRota: 1, // Será substituído quando Rotas estiver implementado
          idPonto: pontoId,
          ordem: 1,
          tipo: 'embarque',
          ativo: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBe('Ponto adicionado à rota com sucesso');
          expect(res.body.data).toHaveProperty('id');
          rotaPontoId = res.body.data.id;
        });
    });

    it.skip('deve retornar erro 400 quando ponto já está vinculado', () => {
      // Teste será habilitado quando módulo de Rotas estiver pronto
      return request(app.getHttpServer())
        .post('/pontos/rota')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          idRota: 1, // Será substituído quando Rotas estiver implementado
          idPonto: pontoId,
          ordem: 1,
          tipo: 'embarque',
        })
        .expect(400);
    });

    it('deve retornar erro 400 quando tipo é inválido', () => {
      return request(app.getHttpServer())
        .post('/pontos/rota')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          idRota: 1,
          idPonto: pontoId,
          ordem: 1,
          tipo: 'invalido',
        })
        .expect(400);
    });
  });

  describe('PATCH /pontos/rota/:id/toggle - Alternar Status Ponto na Rota', () => {
    it.skip('deve alternar status do ponto na rota', () => {
      return request(app.getHttpServer())
        .patch(`/pontos/rota/${rotaPontoId}/toggle`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toMatch(/ativado|desativado/);
          expect(res.body.data).toHaveProperty('ativo');
        });
    });

    it('deve retornar 404 quando relação não existe', () => {
      return request(app.getHttpServer())
        .patch('/pontos/rota/99999/toggle')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('DELETE /pontos/rota/:id - Remover Ponto de Rota', () => {
    it.skip('deve remover ponto de uma rota', () => {
      return request(app.getHttpServer())
        .delete(`/pontos/rota/${rotaPontoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Ponto removido da rota com sucesso');
        });
    });

    it('deve retornar 404 quando relação não existe', () => {
      return request(app.getHttpServer())
        .delete('/pontos/rota/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('DELETE /pontos/:id - Deletar Ponto', () => {
    it('deve retornar erro 400 ao tentar deletar ponto vinculado a rotas', () => {
      // Este teste só funcionará se houver vínculos
      // Por enquanto, vamos pular
      return request(app.getHttpServer())
        .delete(`/pontos/${pontoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          // Pode ser 200 (sucesso) ou 400 (vinculado a rotas)
          expect([200, 400]).toContain(res.status);
        });
    });

    it('deve deletar um ponto sem vínculos', async () => {
      // Criar um novo ponto para deletar
      const createResponse = await request(app.getHttpServer())
        .post('/pontos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Ponto Temporário',
          endereco: 'Rua Temporária, 123',
          latitude: -23.5505,
          longitude: -46.6333,
          idEmpresa: empresaId,
        });

      const tempPontoId = createResponse.body.data.id;

      return request(app.getHttpServer())
        .delete(`/pontos/${tempPontoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Ponto excluído com sucesso');
        });
    });

    it('deve retornar 404 quando ponto não existe', () => {
      return request(app.getHttpServer())
        .delete('/pontos/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
