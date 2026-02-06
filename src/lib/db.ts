import { Pool } from 'pg';

console.log('Connecting to DB:', {
    user: process.env.DB_USER || 'arabia_insurance',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || '5433',
    database: process.env.DB_NAME || 'aiva',
});

const pool = new Pool({
    user: process.env.DB_USER || 'arabia_insurance',
    password: process.env.DB_PASSWORD || 'aivaa@edata.ae',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5433'),
    database: process.env.DB_NAME || 'aiva',
});

export default pool;
