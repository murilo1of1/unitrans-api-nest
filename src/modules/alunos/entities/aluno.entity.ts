import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Plano } from '../../planos/entities/plano.entity';
import { Ponto } from '../../pontos/entities/ponto.entity';

@Entity('alunos')
export class Aluno {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  nome: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  cpf: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    nullable: false,
    select: false,
  })
  passwordHash: string;

  @Column({ type: 'varchar', nullable: true })
  token: string;

  @Column({ name: 'reset_password_token', type: 'varchar', nullable: true })
  resetPasswordToken: string;

  @Column({ name: 'reset_password_expires', type: 'timestamp', nullable: true })
  resetPasswordExpires: Date;

  @Column({ name: 'ponto_embarque', type: 'int', nullable: true })
  pontoEmbarque: number;

  @Column({ name: 'ponto_desembarque', type: 'int', nullable: true })
  pontoDesembarque: number;

  @Column({ name: 'id_plano', type: 'int', nullable: true })
  idPlano: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relações
  @ManyToOne(() => Plano, { nullable: true })
  @JoinColumn({ name: 'id_plano' })
  plano: Plano;

  @ManyToOne(() => Ponto, { nullable: true })
  @JoinColumn({ name: 'ponto_embarque' })
  pontoEmbarqueObj: Ponto;

  @ManyToOne(() => Ponto, { nullable: true })
  @JoinColumn({ name: 'ponto_desembarque' })
  pontoDesembarqueObj: Ponto;
}
