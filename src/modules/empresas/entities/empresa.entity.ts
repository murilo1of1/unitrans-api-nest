import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('empresas')
export class Empresa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column({ unique: true })
  cnpj: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash', select: false })
  passwordHash: string;

  @Column({ name: 'reset_password_token', nullable: true })
  resetPasswordToken: string;

  @Column({ name: 'reset_password_expires', type: 'bigint', nullable: true })
  resetPasswordExpires: number;

  @Column({ nullable: true })
  token: string;

  @Column({
    name: 'tipo_vinculo',
    type: 'enum',
    enum: ['ambos', 'token', 'pesquisa'],
    default: 'ambos',
  })
  tipoVinculo: 'ambos' | 'token' | 'pesquisa';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
