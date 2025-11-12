import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Rota } from './rota.entity';
import { Ponto } from '../../pontos/entities/ponto.entity';

@Entity('rota_pontos')
export class RotaPonto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_rota', type: 'int', nullable: false })
  idRota: number;

  @Column({ name: 'id_ponto', type: 'int', nullable: false })
  idPonto: number;

  @Column({ type: 'int', nullable: false })
  ordem: number;

  @Column({
    type: 'enum',
    enum: ['embarque', 'desembarque'],
    nullable: false,
  })
  tipo: 'embarque' | 'desembarque';

  @Column({ type: 'boolean', default: true, nullable: false })
  ativo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relações
  @ManyToOne(() => Rota, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_rota' })
  rota: Rota;

  @ManyToOne(() => Ponto, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_ponto' })
  ponto: Ponto;
}
