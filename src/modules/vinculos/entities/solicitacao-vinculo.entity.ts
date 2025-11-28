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
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Aluno } from '../../alunos/entities/aluno.entity';

export enum StatusSolicitacao {
  PENDENTE = 'pendente',
  APROVADO = 'aprovado',
  REJEITADO = 'rejeitado',
}

@Entity('solicitacao_vinculo')
@Index('unique_solicitacao_aluno_empresa', ['idAluno', 'idEmpresa'], {
  unique: true,
  where: "status = 'pendente'",
})
export class SolicitacaoVinculo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'aluno_id', type: 'int', nullable: false })
  idAluno: number;

  @Column({ name: 'empresa_id', type: 'int', nullable: false })
  idEmpresa: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: StatusSolicitacao.PENDENTE,
    nullable: false,
  })
  status: StatusSolicitacao;

  @Column({
    name: 'solicitado_em',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  solicitadoEm: Date;

  @Column({ name: 'respondido_em', type: 'timestamp', nullable: true })
  respondidoEm: Date;

  @Column({ name: 'motivo_rejeicao', type: 'text', nullable: true })
  motivoRejeicao: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relações
  @ManyToOne(() => Aluno, { eager: false })
  @JoinColumn({ name: 'aluno_id' })
  aluno: Aluno;

  @ManyToOne(() => Empresa, { eager: false })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;
}
