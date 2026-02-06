const { Client } = require('pg');

const client = new Client({
  user: 'arabia_insurance',
  host: 'localhost',
  database: 'aiva',
  password: 'aivaa@edata.ae',
  port: 5433,
});

async function inspect() {
  try {
    await client.connect();
    console.log('Connected to database');

    const res = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      ORDER BY table_name, ordinal_position;
    `);

    const schema = {};
    res.rows.forEach(row => {
      if (!schema[row.table_name]) {
        schema[row.table_name] = [];
      }
      schema[row.table_name].push({
        column: row.column_name,
        type: row.data_type
      });
    });

    console.log(JSON.stringify(schema, null, 2));
  } catch (err) {
    console.error('Error executing query', err.stack);
  } finally {
    await client.end();
  }
}

inspect();
