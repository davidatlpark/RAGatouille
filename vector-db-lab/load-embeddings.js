require('dotenv').config();
const { Client } = require('pg');
const { OpenAI } = require('openai');

const fs = require('fs');

const rawData = fs.readFileSync('full_format_recipes.json', 'utf-8');
const recipes = JSON.parse(rawData);
const recipeTitles = recipes.map(recipe => recipe.title || "Untitled Recipe");
fs.writeFileSync('recipeTitles.json', JSON.stringify(recipeTitles, null, 2));
console.log('Recipes saved to recipeTitles.json');
console.log(recipeTitles);


async function generateEmbeddings() {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'mysecretpassword',
    database: 'embeddings_lab'
  });

  try {
    await client.connect();

    for (const title of recipeTitles) {
      // Generate embedding using OpenAI
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: title
      });

      const embedding = response.data[0].embedding;

      await client.query(
        'INSERT INTO recipes (title, embedding) VALUES ($1, $2)',
        [title, JSON.stringify(embedding)]
      );

      console.log(`Stored embedding for title: ${title.substring(0, 50)}...`);
    }

    console.log('All embeddings generated and stored!');
  } catch (err) {
    console.error('Error generating embeddings:', err);
  } finally {
    await client.end();
  }
}

generateEmbeddings();