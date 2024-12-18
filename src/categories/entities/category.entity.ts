import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// typeORM: data mapper y active record

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar', length: 60 })
  name: string;
}
