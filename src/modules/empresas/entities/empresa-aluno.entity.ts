import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Empresa } from './empresa.entity';
import { Aluno } from '../../alunos/entities/aluno.entity';

@Entity('empresa_aluno')
@Index('unique_empresa_aluno', ['empresaId', 'alunoId'], { unique: true })
export class EmpresaAluno {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'empresa_id', type: 'int', nullable: false })
  empresaId: number;

  @Column({ name: 'aluno_id', type: 'int', nullable: false })
  alunoId: number;

  @Column({ type: 'boolean', default: true, nullable: false })
  ativo: boolean;

  @Column({
    name: 'data_vinculo',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  dataVinculo: Date;

  @Column({ name: 'data_desvinculo', type: 'timestamp', nullable: true })
  dataDesvinculo: Date | null;

  @Column({
    name: 'origem_vinculo',
    type: 'enum',
    enum: ['token', 'solicitacao', 'manual'],
    nullable: false,
  })
  origemVinculo: 'token' | 'solicitacao' | 'manual';

  @Column({ name: 'vinculado_por', type: 'varchar', nullable: true })
  vinculadoPor: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Empresa, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @ManyToOne(() => Aluno, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'aluno_id' })
  aluno: Aluno;
}
