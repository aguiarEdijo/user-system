import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const getEnv = (key: string, defaultValue?: string): string => {
    const value = process.env[key];
    if (value === undefined && defaultValue === undefined) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value || defaultValue as string;
};

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: getEnv('DB_HOST', 'localhost'),
    port: parseInt(getEnv('DB_PORT', '5432')),
    username: getEnv('DB_USERNAME', 'postgres'),
    password: getEnv('DB_PASSWORD', 'postgres'),
    database: getEnv('DB_DATABASE', 'userdb'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
    logging: true,
};