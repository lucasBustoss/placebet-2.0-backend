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

  @Column()
  month: string;

  @Column('float8')
  stake: number;

  @Column('float8')
  startBank: number;

  @Column('float8')
  finalBank: number;

  @Column('float8')
  profitLoss: number;

  @Column('float8')
  roiBank: number;

  @Column('float8')
  roiStake: number;

  @Column('float8')
  greenDays: number;

  @Column('float8')
  redDays: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default UserStats;
