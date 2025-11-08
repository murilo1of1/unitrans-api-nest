import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('rota_passageiro')
export class RotaPassageiro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_rota' })
  idRota: number;

  @Column({ name: 'id_aluno' })
  idAluno: number;

  @Column({ name: 'ponto_embarque' })
  pontoEmbarque: number;

  @Column({ name: 'ponto_desembarque' })
  pontoDesembarque: number;

  @Column({ name: 'data_escolha', type: 'date' })
  dataEscolha: string;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
