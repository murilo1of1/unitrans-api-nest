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

@Entity('planos')
export class Plano {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'preco_ida',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  precoIda: number;

  @Column({
    name: 'preco_volta',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  precoVolta: number;

  @Column({
    name: 'preco_padrao',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  precoPadrao: number;

  @Column({ name: 'id_empresa', type: 'int', nullable: false })
  idEmpresa: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relação
  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;
}
