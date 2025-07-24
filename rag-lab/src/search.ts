import { Pool } from 'pg';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'mysecretpassword',
    database: 'embeddings_lab'
});

export interface SearchResult {
    title: string;
    similarity: number;
}

export async function searchSimilarRecipe(
    query: string,
    limit: number = 5
): Promise<SearchResult[]> {
    try {
        const embedding = await generateEmbedding(query);
        
        const result = await pool.query<SearchResult>(
            `SELECT 
                title,
                1 - (embedding <=> $1::vector) as similarity
             FROM recipes
             WHERE 1 - (embedding <=> $1::vector) > 0.4
             ORDER BY similarity DESC
             LIMIT $2`,
            [`[${embedding}]`, limit]
        );

        return result.rows;
    } catch (error) {
        console.error('Error searching recipes:', error);
        throw error;
    }
}

async function generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
    });

    return response.data[0].embedding;
}