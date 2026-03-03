import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('pages')
export class Page {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 255, unique: true })
  slug: string;

  @Column({ length: 100 })
  type: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ length: 20, default: 'Draft' })
  status: string;

  @Column({ default: false })
  show_in_footer: boolean;

  @Column({ default: false })
  show_in_menu: boolean;

  @Column({ length: 100 })
  author: string;

  @Column({ default: 0 })
  views: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}