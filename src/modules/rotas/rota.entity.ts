import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('rotas')
export class Rota {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column({ name: 'id_empresa' })
  idEmpresa: number;

  @Column({ nullable: true })
  descricao: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
