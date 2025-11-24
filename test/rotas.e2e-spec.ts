import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Rotas E2E Tests', () => {
  let app: INestApplication;
  let rotaId: number;
  let rotaPontoId: number;
  let empresaId: number;
  let pontoId1: number;
  let pontoId2: number;
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
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();

    // Criar empresa para testes
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 100000);
    const empresaEmail = `empresa-rotas-${timestamp}-${randomSuffix}@test.com`;
    const cnpjBase = `${timestamp}${randomSuffix}`;

    const empresaResponse = await request(app.getHttpServer())
      .post('/empresas')
      .send({
        nome: 'Empresa Teste Rotas',
        email: empresaEmail,
        cnpj: cnpjBase.slice(-14).padStart(14, '0'),
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

    expect([200, 201]).toContain(loginResponse.status);
    expect(loginResponse.body).toHaveProperty('response');
    authToken = loginResponse.body.response;
    expect(authToken).toBeDefined();

    // Criar pontos para os testes de vínculo ponto-rota
    const ponto1Response = await request(app.getHttpServer())
      .post('/pontos')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        nome: 'Terminal Central',
        endereco: 'Av. Principal, 1000',
        latitude: -23.5505,
        longitude: -46.6333,
        idEmpresa: empresaId,
      })
      .expect(201);

    pontoId1 = ponto1Response.body.data.id;

    const ponto2Response = await request(app.getHttpServer())
      .post('/pontos')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        nome: 'Campus Universitário',
        endereco: 'Av. Universitária, 500',
        latitude: -23.56,
        longitude: -46.64,
        idEmpresa: empresaId,
      })
      .expect(201);

    pontoId2 = ponto2Response.body.data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /rotas - Criar Rota', () => {
    it('deve criar uma nova rota', () => {
      return request(app.getHttpServer())
        .post('/rotas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Rota Centro-Campus',
          origem: 'Terminal Central',
          destino: 'Campus Universitário',
          idEmpresa: empresaId,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBe('Rota criada com sucesso');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.nome).toBe('Rota Centro-Campus');
          rotaId = res.body.data.id;
        });
    });

    it('deve retornar erro 400 quando nome não é fornecido', () => {
      return request(app.getHttpServer())
        .post('/rotas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          origem: 'Centro',
          destino: 'Campus',
          idEmpresa: empresaId,
        })
        .expect(400);
    });

    it('deve retornar erro 401 sem autenticação', () => {
      return request(app.getHttpServer())
        .post('/rotas')
        .send({
          nome: 'Rota Teste',
          origem: 'Centro',
          destino: 'Campus',
          idEmpresa: empresaId,
        })
        .expect(401);
    });

    it('deve retornar erro 404 quando empresa não existe', () => {
      return request(app.getHttpServer())
        .post('/rotas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Rota Teste',
          origem: 'Centro',
          destino: 'Campus',
          idEmpresa: 99999,
        })
        .expect(404);
    });
  });

  describe('GET /rotas - Listar Rotas', () => {
    it('deve retornar lista de rotas', () => {
      return request(app.getHttpServer())
        .get('/rotas')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Dados encontrados');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });
  });

  describe('GET /rotas/empresa/:idEmpresa - Listar Rotas por Empresa', () => {
    it('deve retornar rotas de uma empresa específica', () => {
      return request(app.getHttpServer())
        .get(`/rotas/empresa/${empresaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Rotas da empresa encontradas');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('GET /rotas/:id - Buscar Rota por ID', () => {
    it('deve retornar uma rota específica', () => {
      return request(app.getHttpServer())
        .get(`/rotas/${rotaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Dados encontrados');
          expect(res.body.data.id).toBe(rotaId);
          expect(res.body.data.nome).toBe('Rota Centro-Campus');
        });
    });

    it('deve retornar 404 quando rota não existe', () => {
      return request(app.getHttpServer())
        .get('/rotas/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /rotas/:id - Atualizar Rota', () => {
    it('deve atualizar uma rota', () => {
      return request(app.getHttpServer())
        .patch(`/rotas/${rotaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Rota Centro-Campus Atualizada',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Rota atualizada com sucesso');
          expect(res.body.data.nome).toBe('Rota Centro-Campus Atualizada');
        });
    });

    it('deve retornar 404 quando rota não existe', () => {
      return request(app.getHttpServer())
        .patch('/rotas/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Teste',
        })
        .expect(404);
    });
  });

  describe('POST /rotas/:idRota/pontos - Adicionar Ponto à Rota', () => {
    it('deve adicionar ponto de embarque à rota', () => {
      return request(app.getHttpServer())
        .post(`/rotas/${rotaId}/pontos`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          idPonto: pontoId1,
          tipo: 'embarque',
          ordem: 1,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBe('Ponto adicionado à rota com sucesso');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.tipo).toBe('embarque');
          rotaPontoId = res.body.data.id;
        });
    });

    it('deve adicionar ponto de desembarque à rota', () => {
      return request(app.getHttpServer())
        .post(`/rotas/${rotaId}/pontos`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          idPonto: pontoId2,
          tipo: 'desembarque',
          ordem: 2,
        })
        .expect(201);
    });

    it('deve retornar erro 400 quando ponto já existe na rota', () => {
      return request(app.getHttpServer())
        .post(`/rotas/${rotaId}/pontos`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          idPonto: pontoId1,
          tipo: 'embarque',
          ordem: 3,
        })
        .expect(400);
    });

    it('deve retornar erro 404 quando rota não existe', () => {
      return request(app.getHttpServer())
        .post('/rotas/99999/pontos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          idPonto: pontoId1,
          tipo: 'embarque',
          ordem: 1,
        })
        .expect(404);
    });

    it('deve retornar erro 404 quando ponto não existe', () => {
      return request(app.getHttpServer())
        .post(`/rotas/${rotaId}/pontos`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          idPonto: 99999,
          tipo: 'embarque',
          ordem: 1,
        })
        .expect(404);
    });

    it('deve retornar erro 400 quando tipo é inválido', () => {
      return request(app.getHttpServer())
        .post(`/rotas/${rotaId}/pontos`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          idPonto: pontoId1,
          tipo: 'invalido',
          ordem: 1,
        })
        .expect(400);
    });
  });

  describe('GET /rotas/:idRota/pontos - Listar Pontos da Rota', () => {
    it('deve retornar pontos da rota', () => {
      return request(app.getHttpServer())
        .get(`/rotas/${rotaId}/pontos`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Pontos da rota encontrados');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThanOrEqual(2);
        });
    });

    it('deve retornar 404 quando rota não existe', () => {
      return request(app.getHttpServer())
        .get('/rotas/99999/pontos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /rotas/:idRota/pontos/:idRotaPonto - Atualizar Ponto na Rota', () => {
    it('deve atualizar ordem do ponto na rota', () => {
      return request(app.getHttpServer())
        .patch(`/rotas/${rotaId}/pontos/${rotaPontoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ordem: 5,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Ponto da rota atualizado com sucesso');
          expect(res.body.data.ordem).toBe(5);
        });
    });

    it('deve atualizar status ativo do ponto na rota', () => {
      return request(app.getHttpServer())
        .patch(`/rotas/${rotaId}/pontos/${rotaPontoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ativo: false,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.ativo).toBe(false);
        });
    });

    it('deve retornar 404 quando associação não existe', () => {
      return request(app.getHttpServer())
        .patch(`/rotas/${rotaId}/pontos/99999`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ordem: 1,
        })
        .expect(404);
    });
  });

  describe('POST /rotas/passageiros - Buscar Passageiros da Rota', () => {
    it('deve retornar passageiros agrupados por ponto', () => {
      return request(app.getHttpServer())
        .post('/rotas/passageiros')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          idRota: rotaId,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Passageiros da rota encontrados');
          expect(res.body.data).toHaveProperty('rota');
          expect(res.body.data).toHaveProperty('pontosComPassageiros');
          expect(res.body.data).toHaveProperty('totalPassageiros');
          expect(Array.isArray(res.body.data.pontosComPassageiros)).toBe(true);
        });
    });

    it('deve filtrar passageiros por tipo embarque', () => {
      return request(app.getHttpServer())
        .post('/rotas/passageiros')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          idRota: rotaId,
          tipo: 'embarque',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.tipo).toBe('embarque');
        });
    });

    it('deve filtrar passageiros por tipo desembarque', () => {
      return request(app.getHttpServer())
        .post('/rotas/passageiros')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          idRota: rotaId,
          tipo: 'desembarque',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.tipo).toBe('desembarque');
        });
    });

    it('deve retornar erro 404 quando rota não existe', () => {
      return request(app.getHttpServer())
        .post('/rotas/passageiros')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          idRota: 99999,
        })
        .expect(404);
    });

    it('deve retornar erro 400 quando idRota não é fornecido', () => {
      return request(app.getHttpServer())
        .post('/rotas/passageiros')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('DELETE /rotas/:idRota/pontos/:idRotaPonto - Remover Ponto da Rota', () => {
    it('deve remover ponto da rota', () => {
      return request(app.getHttpServer())
        .delete(`/rotas/${rotaId}/pontos/${rotaPontoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Ponto removido da rota com sucesso');
        });
    });

    it('deve retornar 404 quando associação não existe', () => {
      return request(app.getHttpServer())
        .delete(`/rotas/${rotaId}/pontos/99999`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('DELETE /rotas/:id - Deletar Rota', () => {
    it('deve deletar uma rota', () => {
      return request(app.getHttpServer())
        .delete(`/rotas/${rotaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Rota excluída com sucesso');
        });
    });

    it('deve retornar 404 quando rota não existe', () => {
      return request(app.getHttpServer())
        .delete('/rotas/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
