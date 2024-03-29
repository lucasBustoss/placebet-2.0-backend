/* eslint-disable camelcase */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import User from './User';

@Entity('userstats')
class UserStats {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('timestamp with time zone')
  month: Date;

  @Column('float8')
  stake: number;

  @Column('float8')
  startBank: number;

  @Column('float8')
  finalBank: number;

  @Column('float8')
  startBankBetfair: number;

  @Column('float8')
  finalBankBetfair: number;

  @Column('float8')
  profitLoss: number;

  @Column('float8')
  roiBank: number;

  @Column('float8')
  roiStake: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default UserStats;
