import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, Index } from 'typeorm';
import { Dictionary } from '../../dictionary/entities/dictionary.entity';
import { Language } from '../../dictionary/entities/Language.enum';

@Entity()
export class Entry {
  @PrimaryGeneratedColumn()
  id: number;

  // Language 1 Block (Source)
  @Index()
  @Column({ length: 100 })
  wordFrom: string;

  @Index()
  @Column({ type: 'enum', enum: Language })
  languageFrom: Language;

  // Language 2 Block (Target)
  @Index()
  @Column({ length: 100 })
  wordTo: string;

  @Index()
  @Column({ type: 'enum', enum: Language })
  languageTo: Language;

  // Metadata & Filters
  @Index()
  @Column({ length: 50, nullable: true })
  category: string;

  @Column({ length: 1000, nullable: true })
  notes: string;

  @Column({ default: false })
  isFavorite: boolean;

  // Traceability
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // #region RELATIONS

  // Relation to Dictionary (Ownership)
  @ManyToOne(() => Dictionary, (dict) => dict.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dictionaryId' })
  dictionary: Dictionary;

  @Index()
  @Column()
  dictionaryId: number;

  // #endregion
}