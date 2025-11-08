import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('alunos')
export class Aluno {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  cpf: string;

  @Column({ name: 'password_hash', nullable: true, select: false })
  passwordHash: string;

  @Column({ nullable: true })
  token: string;

  @Column({ name: 'id_empresa', nullable: true })
  idEmpresa: number;

  @Column({ name: 'id_plano', nullable: true })
  idPlano: number;

  @Column({ name: 'reset_password_token', nullable: true })
  resetPasswordToken: string;

  @Column({ name: 'reset_password_expires', type: 'bigint', nullable: true })
  resetPasswordExpires: number;

  @Column({ name: 'ponto_embarque', nullable: true })
  pontoEmbarque: number;

  @Column({ name: 'ponto_desembarque', nullable: true })
  pontoDesembarque: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
