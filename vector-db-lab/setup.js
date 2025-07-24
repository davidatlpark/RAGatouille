require('dotenv').config();
const { Client } = require('pg');

async function setup() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'mysecretpassword',
    database: 'embeddings_lab'
  });

  try {
    await client.connect();
    
    // Enable the vector extension
    await client.query('CREATE EXTENSION IF NOT EXISTS vector;');
    
    // Create table for travel activities
    await client.query(`
      CREATE TABLE IF NOT EXISTS recipes (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        embedding vector(1536)
      );
    `);

    console.log('Database setup complete!');
  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    await client.end();
  }
}

setup();