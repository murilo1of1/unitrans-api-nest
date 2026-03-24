import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Aluno } from '../../alunos/entities/aluno.entity';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Plano } from '../../planos/entities/plano.entity';

@Entity('faturas_alunos')
export class FaturaAluno {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'aluno_id', type: 'int', nullable: false })
  alunoId: number;

  @Column({ name: 'empresa_id', type: 'int', nullable: false })
  empresaId: number;

  @Column({ name: 'plano_id', type: 'int', nullable: true })
  planoId: number | null;

  // UUID da cobranca gerada na AbacatePay caso queiramos consultar o status original dela depois
  @Column({ name: 'abacate_pay_id', type: 'varchar', nullable: true })
  abacatePayId: string;

  // Código amigável e único para o motorista/empresa usar no suporte
  @Column({ name: 'codigo_suporte_pagamento', type: 'varchar', length: 20, nullable: true, unique: true })
  codigoSuportePagamento: string;

  // URL ou Código Copia e Cola para o frontend exibir se já estiver gerado
  @Column({ name: 'pix_copia_cola', type: 'text', nullable: true })
  pixCopiaCola: string;

  // Base64 gerado pelo Abacate Pay
  @Column({ name: 'qr_code_base64', type: 'text', nullable: true })
  qrCodeBase64: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  valor: number;

  // "PENDENTE", "PAGA", "ATRASADA", "CANCELADA"
  @Column({ type: 'varchar', length: 20, default: 'PENDENTE' })
  status: string;

  @Column({ name: 'data_vencimento', type: 'timestamp', nullable: false })
  dataVencimento: Date;

  @Column({ name: 'data_pagamento', type: 'timestamp', nullable: true })
  dataPagamento: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  mes_referencia: string; // Ex: 'Março/2026'

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relacionamentos para facilitar o join e typeorm queries
  @ManyToOne(() => Aluno, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'aluno_id' })
  aluno: Aluno;

  @ManyToOne(() => Empresa, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @ManyToOne(() => Plano, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'plano_id' })
  plano: Plano;
}
