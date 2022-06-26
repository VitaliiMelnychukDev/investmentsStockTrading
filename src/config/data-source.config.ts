import { DataSourceOptions } from 'typeorm/data-source/DataSourceOptions';
import { join } from 'path';
import { entitiesList } from '../types/general';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5434,
  username: 'admin',
  password: 'test1234',
  database: 'stock',
  entities: entitiesList,
  migrations: [join(__dirname, '../migrations/*.{ts,js}')],
  synchronize: false,
};
