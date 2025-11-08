import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aluno } from '../../alunos/entities/aluno.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Aluno)
    private alunosRepository: Repository<Aluno>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('TOKEN_KEY') || 'default-secret-key',
    });
  }

  async validate(payload: any) {
    const aluno = await this.alunosRepository.findOne({
      where: { id: payload.idAluno },
    });

    if (!aluno) {
      throw new UnauthorizedException('Aluno não encontrado');
    }

    return {
      id: payload.idAluno,
      nome: payload.nome,
      email: payload.email,
    };
  }
}
