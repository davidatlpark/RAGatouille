import { Pool } from "pg";

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "mysecretpassword",
  database: "embeddings_lab",
});

interface SearchResult {
  id: number;
  activity: string;
  similarity: number;
}

export class VectorSearch {
  async findSimilar(
    embedding: number[],
    limit: number = 5
  ): Promise<SearchResult[]> {
    const query = `
      SELECT
        id,
        activity,
        1 - (embedding <=> $1::vector) AS similarity
      FROM travel_activity
      ORDER BY similarity DESC
      LIMIT $2;
    `;
  
    const result = await pool.query(query, [embedding, limit]);
    return result.rows;
  }
  
  

  async findSimilarAboveThreshold(
    embedding: number[], 
    threshold: number = 0.5,
    limit: number = 5
  ): Promise<SearchResult[]> {
    const query = `
      SELECT 
        id, activity, 
        1 - (embedding <=> $1::vector) AS similarity
      FROM travel_activity
      WHERE 1 - (embedding <=> $1::vector) > $2
      ORDER BY similarity DESC
      LIMIT $3;
    `;
    
    // Pass the embedding directly as an array (no need to stringify)
    const result = await pool.query(query, [embedding, threshold, limit]);
    return result.rows;
  }
  

  async findSimilarWinterActivities(
    embedding: number[],
    limit: number = 5
  ): Promise<SearchResult[]> {
    const query = `
      SELECT 
        id, activity, 
        1 - (embedding <=> $1::vector) AS similarity
      FROM travel_activity
      WHERE activity ILIKE ANY (ARRAY['%snow%', '%ski%', '%ice%', '%winter%', '%sled%', '%cold%', '%frozen%'])
      ORDER BY similarity DESC
      LIMIT $2;
    `;

    const result = await pool.query(query, [embedding, limit]);
    return result.rows;
  }

  async findSimilarToMultiple(
    embeddings: number[][],
    limit: number = 5
  ): Promise<SearchResult[]> {
    // Compute the average vector
    const avgEmbedding = embeddings[0].map(
      (_, i) =>
        embeddings.reduce((sum, vec) => sum + vec[i], 0) / embeddings.length
    );

    const query = `
      SELECT id, activity, 
             1 - (embedding <=> $1::vector) AS similarity
      FROM travel_activity
      ORDER BY similarity DESC
      LIMIT $2;
    `;

    const result = await pool.query(query, [avgEmbedding, limit]);
    return result.rows;
  }
}
