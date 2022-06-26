import { DataSource } from 'typeorm';
import { dataSourceOptions } from './config/data-source.config';

const AppDataSource = new DataSource(dataSourceOptions);

AppDataSource.initialize()
  .then(() => console.log('DB successfully initialized'))
  .catch((error) => console.log(error));

export default AppDataSource;
