# Retrieval Augmented Generation (RAG) Lab

In this lab, you'll build a TypeScript application that implements Retrieval Augmented Generation (RAG) using OpenAI embeddings and pgvector for vector similarity search. You'll use the travel activities database from the previous labs to build a system that can answer questions about travel experiences.

## Lab Overview

1. Set Up Environment
2. Connect to Existing `pgvector` Database
3. Create Document Processing Pipeline
4. Implement Vector Search
5. Build the RAG Query System

## Prerequisites

- Completed the Vector Database Lab and Semantic Search Lab
- Node.js (v16 or above)
- OpenAI API key

## Part 1: Set Up Environment

1. Create a new project and install dependencies:

```bash
mkdir rag-lab
cd rag-lab
npm init -y
npm install typescript @types/node openai dotenv pg @types/pg
npx tsc --init
```

2. Create a `.env` file:

```env
OPENAI_API_KEY=your_api_key_here
```

## Part 2: Connect to Existing Database

We'll use the same database and table structure from the previous labs. Verify the connection by creating `src/db-check.ts`:

```typescript
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
        // Check if we can connect and if the travel_activity table exists
        const result = await pool.query(`
            SELECT COUNT(*) FROM travel_activity;
        `);
        console.log(`Found ${result.rows[0].count} travel activities in database`);
    } catch (error) {
        console.error('Error connecting to database:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

checkDatabase().catch(console.error);
```

When you run this file, you should see an output like:

```
Found 50 travel activities in database
```

## Part 3: Vector Search Implementation

Create `src/search.ts`:

```typescript
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
    activity: string;
    similarity: number;
}

export async function searchSimilarActivities(
    query: string,
    limit: number = 5
): Promise<SearchResult[]> {
    try {
        const embedding = await generateEmbedding(query);
        
        const result = await pool.query<SearchResult>(
            `SELECT 
                activity,
                1 - (embedding <=> $1::vector) as similarity
             FROM travel_activity
             WHERE 1 - (embedding <=> $1::vector) > 0.4
             ORDER BY similarity DESC
             LIMIT $2`,
            [`[${embedding}]`, limit]
        );

        return result.rows;
    } catch (error) {
        console.error('Error searching activities:', error);
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
```

## Part 4: RAG Implementation

Create `src/rag.ts`:

```typescript
import OpenAI from 'openai';
import { searchSimilarActivities } from './search';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function askTravelQuestion(question: string): Promise<string> {
    try {
        // 1. Find relevant travel activities
        const searchResults = await searchSimilarActivities(question, 3);
        
        if (searchResults.length === 0) {
            return "I couldn't find any relevant travel activities to answer your question.";
        }
        
        // 2. Format context from search results
        const context = searchResults
            .map(result => `- ${result.activity} (Similarity: ${result.similarity.toFixed(2)})`)
            .join('\n');
        
        // 3. Create prompt with context
        const prompt = `You are a helpful travel advisor. Use the following relevant travel activities to answer the user's question. If the activities aren't relevant to the question, you can say so.

Available Travel Activities:
${context}

Question: ${question}

Please provide a helpful response based on these activities and your general knowledge about travel.`;
        
        // 4. Get response from OpenAI
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        return completion.choices[0].message.content || 'No answer found';
    } catch (error) {
        console.error('Error in RAG:', error);
        throw error;
    }
}
```

## Part 5: Testing the Implementation

Create `src/index.ts`:

```typescript
import { askTravelQuestion } from './rag';

async function main() {
    // Example travel-related questions
    const questions = [
        "What unique experiences can I have in Japan?",
        "What are some adventurous activities I can do in cold weather?",
        "What are some interesting food-related experiences in Europe?",
        "What unique accommodations are available around the world?"
    ];

    for (const question of questions) {
        console.log('\nQuestion:', question);
        const answer = await askTravelQuestion(question);
        console.log('Answer:', answer);
        console.log('-'.repeat(80));
    }
}

main().catch(console.error);
```

## Exercises
Once you feel comfortable with this project, you can spend any extra time either implementing features like maintaining chat history, or you can move on to the homework lab, "Rag on your own," and start brainstorming ideas for your own project.