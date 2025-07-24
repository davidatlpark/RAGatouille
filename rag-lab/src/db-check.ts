import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function checkDatabase() {
    const pool = new Pool({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'mysecretpassword',
        database: 'embeddings_lab' // Use the same database you used in previous labs
    });

    try {
        const result = await pool.query(`
            SELECT COUNT(*) FROM recipes;
        `);
        console.log(`Found ${result.rows[0].count} recipes in database`);
    } catch (error) {
        console.error('Error connecting to database:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

checkDatabase().catch(console.error);