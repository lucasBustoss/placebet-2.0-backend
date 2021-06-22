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
import Method from './Method';

@Entity('bets')
class Bet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  eventId: string;

  @Column()
  marketId: string;

  @Column()
  eventDescription: string;

  @Column()
  marketDesc: string;

  @Column()
  method_id: string;

  @ManyToOne(() => Method)
  @JoinColumn({ name: 'method_id' })
  method: Method;

  @Column('timestamp with time zone')
  date: Date;

  @Column('timestamp with time zone')
  startTime: Date;

  @Column('float8')
  profitLoss: number;

  @Column()
  synchronized: boolean;

  @Column()
  goalsScored: number;

  @Column()
  goalsConceded: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Bet;
