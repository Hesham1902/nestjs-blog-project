import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

console.log(process.env.NODE_ENV);

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['dist/**/*.entity.js'], // Path to entity files
  migrations: ['dist/db/migrations/*.js'], // Path to migration files
  synchronize: process.env.NODE_ENV === 'development',
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
