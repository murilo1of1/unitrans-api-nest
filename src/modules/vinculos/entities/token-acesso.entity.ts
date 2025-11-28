import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Aluno } from '../../alunos/entities/aluno.entity';

@Entity('token_acesso')
export class TokenAcesso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  token: string;

  @Column({ name: 'empresa_id', type: 'int', nullable: false })
  idEmpresa: number;

  @Column({ type: 'boolean', default: true, nullable: false })
  ativo: boolean;

  @Column({ name: 'data_expiracao', type: 'timestamp', nullable: false })
  dataExpiracao: Date;

  @Column({
    name: 'uso_unico',
    type: 'boolean',
    default: true,
    nullable: false,
  })
  usoUnico: boolean;

  @Column({ type: 'boolean', default: false, nullable: false })
  usado: boolean;

  @Column({ name: 'usado_em', type: 'timestamp', nullable: true })
  usadoEm: Date;

  @Column({ name: 'usado_por', type: 'int', nullable: true })
  usadoPor: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relações
  @ManyToOne(() => Empresa, { eager: false })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @ManyToOne(() => Aluno, { eager: false, nullable: true })
  @JoinColumn({ name: 'usado_por' })
  alunoUsou: Aluno;
}
