import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Language } from './Language.enum';
import { User } from 'src/modules/user/entities/user.entity';

@Entity()
export class Dictionary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name?: string;

  @Column({ length: 255, nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: Language })
  languageFrom: Language;

  @Column({ type: 'enum', enum: Language })
  languageTo: Language;

  @ManyToOne(() => User, (user) => user.dictionaries, { onDelete: 'CASCADE' })
  user: User;

  // Traceability =========================

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}