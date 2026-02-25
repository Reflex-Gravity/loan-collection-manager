import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column()
  country!: string;

  @Column({ type: 'int', default: 1 })
  riskScore!: number;
}
