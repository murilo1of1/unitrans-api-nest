import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { EmpresaAluno } from '../empresas/entities/empresa-aluno.entity';
import {
  SolicitacaoVinculo,
  StatusSolicitacao,
} from '../vinculos/entities/solicitacao-vinculo.entity';
import { TokenAcesso } from '../vinculos/entities/token-acesso.entity';

describe('VinculosController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;
  let empresaId: number;
  let alunoId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        enableImplicitConversion: true,
      }),
    );
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Fazer login e obter token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'joao.silva@example.com',
        senha: 'senha123',
      });

    authToken = loginResponse.body.access_token;

    // Obter IDs de empresa e aluno existentes
    const empresa = await dataSource
      .getRepository('empresa')
      .findOne({ where: {} });
    const aluno = await dataSource
      .getRepository('aluno')
      .findOne({ where: {} });

    empresaId = empresa.id;
    alunoId = aluno.id;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Limpar tabelas de vínculos antes de cada teste
    await dataSource.getRepository(EmpresaAluno).delete({});
    await dataSource.getRepository(SolicitacaoVinculo).delete({});
    await dataSource.getRepository(TokenAcesso).delete({});
  });

  describe('POST /vinculos - Criar Vínculo', () => {
    it('deve criar um vínculo manual', () => {
      return request(app.getHttpServer())
        .post('/vinculos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          empresaId,
          alunoId,
          origemVinculo: 'manual',
          vinculadoPor: 'Admin Teste',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBe('Vínculo criado com sucesso!');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.empresaId).toBe(empresaId);
          expect(res.body.data.alunoId).toBe(alunoId);
          expect(res.body.data.ativo).toBe(true);
        });
    });

    it('deve retornar 400 se vínculo já existe', async () => {
      // Criar vínculo primeiro
      await request(app.getHttpServer())
        .post('/vinculos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          empresaId,
          alunoId,
          origemVinculo: 'manual',
          vinculadoPor: 'Admin',
        });

      // Tentar criar novamente
      return request(app.getHttpServer())
        .post('/vinculos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          empresaId,
          alunoId,
          origemVinculo: 'manual',
          vinculadoPor: 'Admin',
        })
        .expect(400);
    });

    it('deve retornar 400 se campos obrigatórios estão faltando', () => {
      return request(app.getHttpServer())
        .post('/vinculos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          empresaId,
        })
        .expect(400);
    });
  });

  describe('GET /vinculos - Listar Vínculos', () => {
    beforeEach(async () => {
      // Criar alguns vínculos
      await request(app.getHttpServer())
        .post('/vinculos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          empresaId,
          alunoId,
          origemVinculo: 'manual',
          vinculadoPor: 'Admin',
        });
    });

    it('deve listar todos os vínculos', () => {
      return request(app.getHttpServer())
        .get('/vinculos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Vínculos encontrados');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('deve listar vínculos com filtro de empresa', () => {
      return request(app.getHttpServer())
        .get(`/vinculos?empresaId=${empresaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.every((v) => v.empresaId === empresaId)).toBe(
            true,
          );
        });
    });
  });

  describe('GET /vinculos/aluno/:idAluno - Listar Vínculos do Aluno', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/vinculos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          empresaId,
          alunoId,
          origemVinculo: 'manual',
          vinculadoPor: 'Admin',
        });
    });

    it('deve listar vínculos de um aluno específico', () => {
      return request(app.getHttpServer())
        .get(`/vinculos/aluno/${alunoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Vínculos do aluno encontrados');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.every((v) => v.alunoId === alunoId)).toBe(true);
        });
    });
  });

  describe('PATCH /vinculos/:id/desativar - Desativar Vínculo', () => {
    let vinculoId: number;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/vinculos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          empresaId,
          alunoId,
          origemVinculo: 'manual',
          vinculadoPor: 'Admin',
        });

      vinculoId = response.body.data.id;
    });

    it('deve desativar um vínculo', () => {
      return request(app.getHttpServer())
        .patch(`/vinculos/${vinculoId}/desativar`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Vínculo desativado com sucesso!');
        });
    });

    it('deve retornar 404 se vínculo não existe', () => {
      return request(app.getHttpServer())
        .patch('/vinculos/999999/desativar')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /vinculos/:id/reativar - Reativar Vínculo', () => {
    let vinculoId: number;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/vinculos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          empresaId,
          alunoId,
          origemVinculo: 'manual',
          vinculadoPor: 'Admin',
        });

      vinculoId = response.body.data.id;

      // Desativar primeiro
      await request(app.getHttpServer())
        .patch(`/vinculos/${vinculoId}/desativar`)
        .set('Authorization', `Bearer ${authToken}`);
    });

    it('deve reativar um vínculo desativado', () => {
      return request(app.getHttpServer())
        .patch(`/vinculos/${vinculoId}/reativar`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Vínculo reativado com sucesso!');
        });
    });
  });

  describe('POST /vinculos/token - Gerar Token', () => {
    it('deve gerar um token de acesso', () => {
      return request(app.getHttpServer())
        .post('/vinculos/token')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          empresaId,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBe('Token de acesso gerado com sucesso!');
          expect(res.body.data).toHaveProperty('token');
          expect(res.body.data.token).toHaveLength(8);
        });
    });

    it('deve retornar 404 se empresa não existe', () => {
      return request(app.getHttpServer())
        .post('/vinculos/token')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          empresaId: 999999,
        })
        .expect(404);
    });
  });

  describe('GET /vinculos/token - Listar Tokens', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/vinculos/token')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ empresaId });
    });

    it('deve listar todos os tokens', () => {
      return request(app.getHttpServer())
        .get('/vinculos/token')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Tokens encontrados');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('PATCH /vinculos/token/:id/revogar - Revogar Token', () => {
    let tokenId: number;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/vinculos/token')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ empresaId });

      // Buscar token criado
      const tokens = await dataSource.getRepository(TokenAcesso).find();
      tokenId = tokens[0].id;
    });

    it('deve revogar um token', () => {
      return request(app.getHttpServer())
        .patch(`/vinculos/token/${tokenId}/revogar`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Token revogado com sucesso!');
        });
    });
  });

  describe('POST /vinculos/usar-token - Vincular por Token', () => {
    let token: string;
    let segundoAlunoId: number;

    beforeEach(async () => {
      // Criar segundo aluno para teste
      const alunos = await dataSource.getRepository('aluno').find();
      segundoAlunoId = alunos[1]?.id || alunoId;

      // Gerar token
      const response = await request(app.getHttpServer())
        .post('/vinculos/token')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ empresaId });

      token = response.body.data.token;
    });

    it('deve vincular aluno usando token válido', () => {
      return request(app.getHttpServer())
        .post('/vinculos/usar-token')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          token,
          alunoId: segundoAlunoId,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Vínculo criado via token com sucesso!',
          );
          expect(res.body.data.alunoId).toBe(segundoAlunoId);
          expect(res.body.data.origemVinculo).toBe('token');
        });
    });

    it('deve retornar 400 se token inválido', () => {
      return request(app.getHttpServer())
        .post('/vinculos/usar-token')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          token: 'INVALIDO',
          alunoId: segundoAlunoId,
        })
        .expect(400);
    });

    it('deve retornar 400 se vínculo já existe', async () => {
      // Usar token primeira vez
      await request(app.getHttpServer())
        .post('/vinculos/usar-token')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          token,
          alunoId: segundoAlunoId,
        });

      // Gerar novo token e tentar vincular novamente o mesmo aluno
      const response2 = await request(app.getHttpServer())
        .post('/vinculos/token')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ empresaId });

      return request(app.getHttpServer())
        .post('/vinculos/usar-token')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          token: response2.body.data.token,
          alunoId: segundoAlunoId,
        })
        .expect(400);
    });
  });

  describe('POST /vinculos/solicitacao - Solicitar Vínculo', () => {
    it('deve criar solicitação de vínculo', () => {
      return request(app.getHttpServer())
        .post('/vinculos/solicitacao')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          alunoId,
          empresaId,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Solicitação de vínculo enviada com sucesso!',
          );
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.status).toBe(StatusSolicitacao.PENDENTE);
        });
    });

    it('deve retornar 400 se já existe vínculo ativo', async () => {
      // Criar vínculo primeiro
      await request(app.getHttpServer())
        .post('/vinculos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          empresaId,
          alunoId,
          origemVinculo: 'manual',
          vinculadoPor: 'Admin',
        });

      // Tentar solicitar vínculo
      return request(app.getHttpServer())
        .post('/vinculos/solicitacao')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          alunoId,
          empresaId,
        })
        .expect(400);
    });

    it('deve retornar 400 se já existe solicitação pendente', async () => {
      // Criar solicitação primeiro
      await request(app.getHttpServer())
        .post('/vinculos/solicitacao')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          alunoId,
          empresaId,
        });

      // Tentar criar novamente
      return request(app.getHttpServer())
        .post('/vinculos/solicitacao')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          alunoId,
          empresaId,
        })
        .expect(400);
    });
  });

  describe('GET /vinculos/solicitacao - Listar Solicitações', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/vinculos/solicitacao')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          alunoId,
          empresaId,
        });
    });

    it('deve listar todas as solicitações', () => {
      return request(app.getHttpServer())
        .get('/vinculos/solicitacao')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Solicitações encontradas');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('deve listar solicitações com filtro de status', () => {
      return request(app.getHttpServer())
        .get(`/vinculos/solicitacao?status=${StatusSolicitacao.PENDENTE}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(
            res.body.data.every((s) => s.status === StatusSolicitacao.PENDENTE),
          ).toBe(true);
        });
    });
  });

  describe('PATCH /vinculos/solicitacao/:id/aprovar - Aprovar Solicitação', () => {
    let solicitacaoId: number;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/vinculos/solicitacao')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          alunoId,
          empresaId,
        });

      solicitacaoId = response.body.data.id;
    });

    it('deve aprovar solicitação e criar vínculo', () => {
      return request(app.getHttpServer())
        .patch(`/vinculos/solicitacao/${solicitacaoId}/aprovar`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Solicitação aprovada e vínculo criado com sucesso!',
          );
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.empresaId).toBe(empresaId);
          expect(res.body.data.alunoId).toBe(alunoId);
          expect(res.body.data.origemVinculo).toBe('solicitacao');
        });
    });

    it('deve retornar 404 se solicitação não existe', () => {
      return request(app.getHttpServer())
        .patch('/vinculos/solicitacao/999999/aprovar')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('deve retornar 400 se solicitação já foi respondida', async () => {
      // Aprovar primeiro
      await request(app.getHttpServer())
        .patch(`/vinculos/solicitacao/${solicitacaoId}/aprovar`)
        .set('Authorization', `Bearer ${authToken}`);

      // Tentar aprovar novamente
      return request(app.getHttpServer())
        .patch(`/vinculos/solicitacao/${solicitacaoId}/aprovar`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('PATCH /vinculos/solicitacao/:id/rejeitar - Rejeitar Solicitação', () => {
    let solicitacaoId: number;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/vinculos/solicitacao')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          alunoId,
          empresaId,
        });

      solicitacaoId = response.body.data.id;
    });

    it('deve rejeitar solicitação com motivo', () => {
      return request(app.getHttpServer())
        .patch(`/vinculos/solicitacao/${solicitacaoId}/rejeitar`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          motivoRejeicao: 'Não atende os requisitos',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Solicitação rejeitada com sucesso!');
        });
    });

    it('deve rejeitar solicitação sem motivo', () => {
      return request(app.getHttpServer())
        .patch(`/vinculos/solicitacao/${solicitacaoId}/rejeitar`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(200);
    });

    it('deve retornar 400 se solicitação já foi respondida', async () => {
      // Rejeitar primeiro
      await request(app.getHttpServer())
        .patch(`/vinculos/solicitacao/${solicitacaoId}/rejeitar`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      // Tentar rejeitar novamente
      return request(app.getHttpServer())
        .patch(`/vinculos/solicitacao/${solicitacaoId}/rejeitar`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('Fluxo Completo: Token → Vínculo', () => {
    it('deve completar fluxo de geração e uso de token', async () => {
      // 1. Gerar token
      const tokenResponse = await request(app.getHttpServer())
        .post('/vinculos/token')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ empresaId })
        .expect(201);

      const token = tokenResponse.body.data.token;
      expect(token).toHaveLength(8);

      // 2. Usar token para vincular
      const vinculoResponse = await request(app.getHttpServer())
        .post('/vinculos/usar-token')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          token,
          alunoId,
        })
        .expect(201);

      expect(vinculoResponse.body.data.origemVinculo).toBe('token');

      // 3. Verificar que vínculo foi criado
      const vinculosResponse = await request(app.getHttpServer())
        .get(`/vinculos/aluno/${alunoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(vinculosResponse.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Fluxo Completo: Solicitação → Aprovação → Vínculo', () => {
    it('deve completar fluxo de solicitação e aprovação', async () => {
      // 1. Criar solicitação
      const solicitacaoResponse = await request(app.getHttpServer())
        .post('/vinculos/solicitacao')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          alunoId,
          empresaId,
        })
        .expect(201);

      const solicitacaoId = solicitacaoResponse.body.data.id;
      expect(solicitacaoResponse.body.data.status).toBe(
        StatusSolicitacao.PENDENTE,
      );

      // 2. Aprovar solicitação
      const aprovarResponse = await request(app.getHttpServer())
        .patch(`/vinculos/solicitacao/${solicitacaoId}/aprovar`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(aprovarResponse.body.data.origemVinculo).toBe('solicitacao');

      // 3. Verificar que vínculo foi criado
      const vinculosResponse = await request(app.getHttpServer())
        .get(`/vinculos/aluno/${alunoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(vinculosResponse.body.data.length).toBeGreaterThan(0);
      expect(vinculosResponse.body.data[0].ativo).toBe(true);
    });
  });
});
