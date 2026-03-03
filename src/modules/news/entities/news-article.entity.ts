import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('news_articles')
export class NewsArticle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 100 })
  category: string;

  @Column({ type: 'text', nullable: true })
  excerpt: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ length: 100 })
  author: string;

  @Column({ type: 'text', nullable: true })
  image_url: string;

  @Column({ type: 'timestamp', nullable: true })  // ← Date টাইপ করুন
  published_date: Date | null;  // ← Date | null টাইপ করুন

  @Column({ length: 20, default: 'Draft' })
  status: string;

  @Column({ default: 0 })
  views: number;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ default: false })
  featured: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}