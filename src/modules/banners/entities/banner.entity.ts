import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  image_url: string;  // ← এই নামটা গুরুত্বপূর্ণ

  @Column({ type: 'text', nullable: true })
  link: string;        // ← এই নামটা গুরুত্বপূর্ণ

  @Column({ length: 100 })
  position: string;

  @Column({ default: 0 })
  priority: number;

  @Column({ length: 20, default: 'Active' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}