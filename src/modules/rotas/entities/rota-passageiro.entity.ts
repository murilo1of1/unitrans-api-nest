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
import { Rota } from './rota.entity';
import { Aluno } from '../../alunos/entities/aluno.entity';
import { Ponto } from '../../pontos/entities/ponto.entity';

@Entity('rota_passageiros')
@Index('unique_rota_aluno_data', ['idRota', 'idAluno', 'dataEscolha'], {
  unique: true,
})
export class RotaPassageiro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_rota', type: 'int', nullable: false })
  idRota: number;

  @Column({ name: 'id_aluno', type: 'int', nullable: false })
  idAluno: number;

  @Column({ name: 'ponto_embarque', type: 'int', nullable: false })
  pontoEmbarque: number;

  @Column({ name: 'ponto_desembarque', type: 'int', nullable: false })
  pontoDesembarque: number;

  @Column({
    name: 'data_escolha',
    type: 'date',
    nullable: false,
    default: () => 'CURRENT_DATE',
  })
  dataEscolha: Date;

  @Column({ type: 'boolean', default: true, nullable: false })
  ativo: boolean;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relações
  @ManyToOne(() => Rota, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_rota' })
  rota: Rota;

  @ManyToOne(() => Aluno, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_aluno' })
  aluno: Aluno;

  @ManyToOne(() => Ponto, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ponto_embarque' })
  pontoEmbarqueObj: Ponto;

  @ManyToOne(() => Ponto, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ponto_desembarque' })
  pontoDesembarqueObj: Ponto;
}
