import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Aluno } from '../alunos/entities/aluno.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { LoginDto } from './dto/login.dto';
import { LoginEmpresaDto } from './dto/login-empresa.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from '../../common/services/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Aluno)
    private alunosRepository: Repository<Aluno>,
    @InjectRepository(Empresa)
    private empresasRepository: Repository<Empresa>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, senha } = loginDto;

    const aluno = await this.alunosRepository
      .createQueryBuilder('aluno')
      .where('aluno.email = :email', { email })
      .addSelect('aluno.passwordHash')
      .getOne();

    if (!aluno) {
      throw new BadRequestException('Email não encontrado');
    }

    if (!aluno.passwordHash) {
      throw new BadRequestException('Aluno não possui senha cadastrada');
    }

    const senhaValida = await bcrypt.compare(senha, aluno.passwordHash);

    if (!senhaValida) {
      throw new UnauthorizedException('Usuário ou senha incorretos');
    }

    const payload = {
      idAluno: aluno.id,
      nome: aluno.nome,
      email: aluno.email,
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'Sucesso',
      response: token,
    };
  }

  async loginEmpresa(loginEmpresaDto: LoginEmpresaDto) {
    const { email, senha } = loginEmpresaDto;

    const empresa = await this.empresasRepository
      .createQueryBuilder('empresa')
      .where('empresa.email = :email', { email })
      .addSelect('empresa.passwordHash')
      .getOne();

    if (!empresa) {
      throw new BadRequestException('Email não encontrado');
    }

    if (!empresa.passwordHash) {
      throw new BadRequestException('Empresa não possui senha cadastrada');
    }

    const senhaValida = await bcrypt.compare(senha, empresa.passwordHash);

    if (!senhaValida) {
      throw new UnauthorizedException('Usuário ou senha incorretos');
    }

    const payload = {
      idEmpresa: empresa.id,
      nome: empresa.nome,
      email: empresa.email,
      cnpj: empresa.cnpj,
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'Sucesso',
      response: token,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    // Tentar encontrar aluno
    const aluno = await this.alunosRepository.findOne({ where: { email } });

    if (aluno) {
      const resetToken = crypto.randomBytes(20).toString('hex');
      const resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

      await this.alunosRepository.update(
        { id: aluno.id },
        {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetPasswordExpires,
        },
      );

      const mailHtml = `<p>Você solicitou a recuperação de sua senha. Seu código temporário é: <strong>${resetToken}</strong>. Ele expirará em 30 minutos.</p>`;

      await this.emailService.sendMail(email, 'Recuperação de Senha', mailHtml);

      return {
        message:
          'Um e-mail com as instruções de recuperação foi enviado (se o e-mail existir em nosso sistema).',
      };
    }

    // Tentar encontrar empresa
    const empresa = await this.empresasRepository.findOne({ where: { email } });

    if (empresa) {
      const resetToken = crypto.randomBytes(20).toString('hex');
      const resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

      await this.empresasRepository.update(
        { id: empresa.id },
        {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetPasswordExpires,
        },
      );

      const mailHtml = `<p>Você solicitou a recuperação de sua senha. Seu código temporário é: <strong>${resetToken}</strong>. Ele expirará em 30 minutos.</p>`;

      await this.emailService.sendMail(email, 'Recuperação de Senha', mailHtml);
    }

    // Sempre retorna a mesma mensagem por segurança (não revela se email existe)
    return {
      message:
        'Um e-mail com as instruções de recuperação foi enviado (se o e-mail existir em nosso sistema).',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    // Tentar encontrar aluno com token válido
    const aluno = await this.alunosRepository.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: MoreThan(new Date()),
      },
    });

    if (aluno) {
      const passwordHash = await bcrypt.hash(newPassword, 10);

      await this.alunosRepository.update(
        { id: aluno.id },
        {
          passwordHash: passwordHash,
          resetPasswordToken: undefined,
          resetPasswordExpires: undefined,
        },
      );

      return {
        message: 'Senha redefinida com sucesso!',
      };
    }

    // Tentar encontrar empresa com token válido
    const empresa = await this.empresasRepository.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: MoreThan(new Date()),
      },
    });

    if (empresa) {
      const passwordHash = await bcrypt.hash(newPassword, 10);

      await this.empresasRepository.update(
        { id: empresa.id },
        {
          passwordHash: passwordHash,
          resetPasswordToken: undefined,
          resetPasswordExpires: undefined,
        },
      );

      return {
        message: 'Senha redefinida com sucesso!',
      };
    }

    // Se não encontrou nem aluno nem empresa
    throw new BadRequestException(
      'Código de recuperação inválido ou expirado.',
    );
  }
}
