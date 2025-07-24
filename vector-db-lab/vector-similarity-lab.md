# Vector Similarity Search Lab

In this lab, you'll learn how to perform vector similarity search using `pgvector` with both SQL and TypeScript. Building on the travel activities database we created earlier, you'll learn how to:

1. Query vector embeddings using cosine similarity
2. Implement nearest neighbor lookups
3. Use TypeScript to interact with vector embeddings

## Prerequisites

- Completed Vector Database Lab (with travel activities loaded)
- PostgreSQL with `pgvector` extension installed
- Node.js and TypeScript

## Part 1: SQL Vector Similarity Queries

### 1.1 Basic Cosine Similarity Search

The cosine similarity operator in `pgvector` is `<=>`. Here's an example of how to find the most similar travel activities:

```sql
-- Find 5 most similar activities to a given vector
SELECT id, activity, embedding <=> '[0.1, 0.2, 0.3]'::vector AS similarity
FROM travel_activity
ORDER BY embedding <=> '[0.1, 0.2, 0.3]'::vector
LIMIT 5;
```

Note that this query will not work directly with our database, because this example uses an embedding with only 3 elements, whereas our database contains embeddings with 1,536 elements. To make it work, we'll need to retrieve embeddings with the correct dimensionality from subqueries and use them in statements like this.

### 1.2 Converting Cosine Distance to Similarity

Since `pgvector` returns cosine distance (where lower is better), convert to similarity:

```sql
-- Convert distance to similarity score (1 is most similar, 0 is least similar)
SELECT id, activity, 
       1 - (embedding <=> '[0.1, 0.2, 0.3]'::vector) AS cosine_similarity
FROM travel_activity
ORDER BY cosine_similarity DESC
LIMIT 5;
```

### Exercise 1: Basic Similarity Search

Write a query that:
1. Finds the 3 most similar activities to the "Stay in an ice hotel" activity's embedding
2. Returns the id, activity text, and similarity score

Hint: You'll need to first get the embedding for "Stay in an ice hotel" using a subquery.

<!-- -- Step 1: Get the embedding for "Stay in an Ice Hotel"
SELECT embedding 
FROM travel_activity 
WHERE activity ILIKE '%ice hotel%' 
LIMIT 1; -->

<!-- -- Step 2: Find the 3 most similar activities
SELECT id, activity, 
       1 - (embedding <=> (SELECT embedding FROM travel_activity WHERE activity ILIKE '%ice hotel%' LIMIT 1)) AS similarity
FROM travel_activity
ORDER BY similarity DESC
LIMIT 3; -->

## Part 2: TypeScript Implementation

### 2.1 Basic Setup

First, let's set up the TypeScript code to interact with `pgvector`:

```typescript
// vector-search.ts
// vector-search.ts
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'mysecretpassword',
  database: 'embeddings_lab'
});

interface SearchResult {
  id: number;
  activity: string;
  similarity: number;
}

export class VectorSearch {
  async findSimilar(embedding: number[], limit: number = 5): Promise<SearchResult[]> {
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
  ) {
    // TODO: Implement function
  }

  async findSimilarWinterActivities(
    embedding: number[],
    limit: number = 5
  ) {
    // TODO: Implement function
  }

  async findSimilarToMultiple(
    embeddings: number[][],
    limit: number = 5
  ) {
    // TODO: Implement function
  }
}
```

### Exercise 2: Implement Vector Search

We'll now work on expanding the functionality of our `VectorSearch` class. We have three more functions we'd like to add that you can see as TODOs in `vector-search.ts`:
1. A function to find similar activities above a similarity threshold
2. A function to find similar winter activities (hint: use text search on the activity field combined with vector similarity. Think simple, as in activities that have keywords that indicate they are "winter" activities) 
3. A function that finds activities similar to multiple reference activities

Here's a test file you may use to see how we'd like to use these functions. You'll need to save the `sample-embeddings.json` into your project directory.

```ts
// test-vector-search.ts
import { VectorSearch } from './vector-search';
import * as fs from 'fs';
import * as path from 'path';

// Load sample embeddings from an external file (e.g., embeddings.json)
let data = fs.readFileSync(path.join(__dirname, 'sample-embeddings.json'), 'utf-8');
let embeddings = JSON.parse(data);

// Create an instance of VectorSearch
const vectorSearch = new VectorSearch();

// Run a test for using `findSimilar`
async function testFindSimilar() {
  const sample = embeddings[0]
  const embedding = sample.embedding; // Use the embedding of the first activity
  console.log(`Test: Find Most Similar Activities using sample activity:\n ${sample.activity}`);

  const results = await vectorSearch.findSimilar(embedding);
  console.log('Results:', results);
}

// Run a test for finding similar above a threshold
async function testFindSimilarAboveThreshold() {
  const sample = embeddings[0]
  const embedding = sample.embedding;
  const threshold = 0.4; // Example threshold value for similarity

  console.log(`Test: Find Similar Activities Above Threshold (${threshold}) using sample activity:\n ${sample.activity}`);

  const results = await vectorSearch.findSimilarAboveThreshold(embedding);

  console.log('Results:\n', results);
}

// Run a test for finding similar winter activities (e.g., skiing, snowboarding)
async function testFindSimilarWinterActivities() {
  const sample = embeddings[0]
  const embedding = sample.embedding;
  console.log('Type of embeddings: ', typeof embedding);

  console.log(`Test: Find Similar Winter Activies using sample activity:\n ${sample.activity}`);

  const results = await vectorSearch.findSimilarWinterActivities(embedding);

  console.log('Results:\n', results);
}

// Run a test for finding similar to multiple reference activities
async function testFindSimilarToMultiple() {
  const referenceActivities = embeddings.slice(0, 2); // Use the first two activities as reference
  const referenceEmbeddings = referenceActivities.map(activity => activity.embedding);
  console.log(`Test: Find Similar to Multiple Reference Activities:\n1. ${referenceActivities[0].activity}\n2. ${referenceActivities[1].activity}`);
  const results = await vectorSearch.findSimilarToMultiple(referenceEmbeddings);

  console.log('Results:\n', results);
}

// Run all tests
async function runTests() {
  await testFindSimilar();
  await testFindSimilarAboveThreshold();
  await testFindSimilarWinterActivities();
  await testFindSimilarToMultiple();
}

// Execute tests
runTests().catch(console.error);
```
## Part 3: Advanced Topics
For 3.1 and 3.2, you don't need to make any changes, but try to read and understand what the code is doing and how it works. 
### 3.1 Using Indexes for Performance

```sql
-- Create an index for faster similarity search
CREATE INDEX ON travel_activity USING hnsw (embedding vector_cosine_ops);
```

### 3.2 Batch Processing

```typescript
// batch-search.ts
async function batchSimilaritySearch(
  embeddings: number[][],
  limit: number = 5
): Promise<SearchResult[][]> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const results = await Promise.all(
      embeddings.map(embedding => 
        client.query(
          `SELECT id, activity, 1 - (embedding <=> $1::vector) AS similarity 
           FROM travel_activity 
           ORDER BY similarity DESC 
           LIMIT $2`,
          [`[${embedding}]`, limit]
        )
      )
    );

    await client.query('COMMIT');
    return results.map(r => r.rows);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

## Exercises

1. Find all activities that are similar to both "ice hotel" and "northern lights" activities (hint: use the intersection of results)

2. Create a TypeScript class that implements caching for frequently accessed activity embeddings

3. Write a function that performs hybrid search combining:
   - Vector similarity
   - Text search (e.g., matching keywords like "cooking", "adventure", etc.)
   - Filtering (e.g., by activity type or location)

## Bonus Challenge

Implement a travel activity recommendation API endpoint using Express that:
1. Accepts an activity ID
2. Finds similar activities using vector similarity
3. Returns ranked recommendations with similarity scores
4. Groups recommendations by type (adventure, culinary, cultural, etc.)

## Solutions

Check the solutions file for complete implementations of all exercises.

Remember:
- Always use parameterized queries to prevent SQL injection
- Consider adding indexes for better performance
- Handle errors appropriately
- Consider connection pooling for production use
- Add appropriate logging and monitoring

Happy coding! 🚀 