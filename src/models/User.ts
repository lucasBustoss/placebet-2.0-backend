/* eslint-disable camelcase */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  loginBetfair: string;

  @Column()
  emailBetfair: string;

  @Column()
  appKey: string;

  @Column()
  currencyType: string;

  @Column()
  startBank: number;

  @Column()
  startBetfairBank: number;

  @Column()
  date: Date;

  @Column()
  moneyType: number;

  @Column()
  stake: number;

  @Column()
  visibility: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default User;
