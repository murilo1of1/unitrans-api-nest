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

  @Column({ type: 'varchar', nullable: false })
  nome: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  cnpj: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    nullable: false,
    select: false,
  })
  passwordHash: string;

  @Column({ name: 'stripe_account_id', type: 'varchar', nullable: true })
  stripeAccountId: string;

  @Column({ name: 'reset_password_token', type: 'varchar', nullable: true })
  resetPasswordToken: string;

  @Column({ name: 'reset_password_expires', type: 'timestamp', nullable: true })
  resetPasswordExpires: Date;

  @Column({ type: 'varchar', nullable: true })
  token: string;

  @Column({
    name: 'tipo_vinculo',
    type: 'enum',
    enum: ['ambos', 'token', 'pesquisa'],
    default: 'ambos',
    nullable: false,
  })
  tipoVinculo: 'ambos' | 'token' | 'pesquisa';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
