# Vector Database Lab

In this lab, you'll learn how to:
1. Set up Postgres with the `pgvector` extension
2. Generate embeddings from text using OpenAI's API
3. Store and query vector embeddings in Postgres

Estimated time: 30 minutes

## Prerequisites
- Node.js installed
- OpenAI API key
- Postgres installed on your machine

## Part 1: Setting Up Postgres with pgvector

1. Create a new directory for your project and initialize it:

```bash
mkdir vector-db-lab
cd vector-db-lab
npm init -y
```

2. Install the required dependencies:

```bash
npm install pg openai dotenv
```

3. Create a `.env` file and add your OpenAI API key:

```
OPENAI_API_KEY=your_api_key_here
```

4. Create database
```bash
psql
=# CREATE DATABASE embeddings_lab;
```

## Part 2: Database Setup

Create a file called `setup.js`:

```javascript:setup.js
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
      CREATE TABLE IF NOT EXISTS travel_activity (
        id SERIAL PRIMARY KEY,
        activity TEXT NOT NULL,
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
```

## Part 3: Generate and Store Embeddings

Create a file called `load-embeddings.js`:

```javascript:load-embeddings.js
require('dotenv').config();
const { Client } = require('pg');
const { OpenAI } = require('openai');

// Travel activities dataset
const travelActivities = [
  "Take a hot air balloon ride over the fairy chimneys of Cappadocia, Turkey",
  "Swim with bioluminescent plankton at Mosquito Bay in Puerto Rico",
  "Dine in complete darkness at the Blind Restaurant in Berlin, Germany",
  "Walk across the glass-bottom skywalk at the Grand Canyon West Rim",
  "Stay in an underwater hotel room at the Atlantis Resort in Dubai",
  "Attend a traditional tea ceremony in Kyoto's oldest teahouse",
  "Go dog sledding under the Northern Lights in Tromsø, Norway",
  "Take a chocolate-making workshop at the Maison Cailler factory in Switzerland",
  "Sleep in an ice hotel at the ICEHOTEL in Jukkasjärvi, Sweden",
  "Ride a vintage Vespa through the Tuscan countryside",
  "Float in the Dead Sea while reading a newspaper in Jordan",
  "Participate in the tomato-throwing festival La Tomatina in Buñol, Spain",
  "Have breakfast with giraffes at Giraffe Manor in Nairobi, Kenya",
  "Take a cooking class in a traditional riad in Marrakech, Morocco",
  "Visit the glow worm caves in Waitomo, New Zealand",
  "Meditate with Buddhist monks at a temple in Chiang Mai, Thailand",
  "Ride the Trans-Siberian Railway from Moscow to Beijing",
  "Stay in a treehouse in the Amazon rainforest",
  "Learn to make pasta from an Italian nonna in Bologna",
  "Watch the sunrise from Mount Haleakala in Maui, Hawaii",
  "Take a tango lesson in Buenos Aires' historic San Telmo district",
  "Visit the robot restaurant show in Tokyo, Japan",
  "Sail through the fjords of Norway on a traditional Viking ship",
  "Attend a Gatsby-style party at a château in the French Riviera",
  "Go truffle hunting with dogs in Alba, Italy",
  "Take a street art tour in Melbourne's laneways",
  "Participate in a traditional Māori hangi feast in Rotorua",
  "Sleep under the stars in a bubble hotel in Iceland",
  "Learn falconry at a medieval castle in Ireland",
  "Take a sunset camel ride through the Sahara Desert",
  "Attend a traditional Korean temple stay program in Seoul",
  "Paint tiles in a traditional azulejo workshop in Porto, Portugal",
  "Go ice swimming in Finland followed by a traditional sauna",
  "Take a vodka-tasting tour in a historic distillery in Warsaw",
  "Learn to make sushi from a master chef in Tokyo",
  "Stay in a converted lighthouse on the Scottish coast",
  "Participate in an olive harvest in Greece",
  "Take a ghost tour in the Edinburgh underground vaults",
  "Learn to play the didgeridoo in the Australian Outback",
  "Make your own perfume in Grasse, France",
  "Stay in a converted wine barrel in the Douro Valley, Portugal",
  "Take a traditional mask-making workshop in Venice, Italy",
  "Go horseback riding with gauchos in the Argentine Pampas",
  "Learn to make Belgian chocolate in a historic workshop in Bruges",
  "Participate in a traditional Chinese tea ceremony in Hangzhou",
  "Take a midnight sun golf game in Iceland",
  "Learn to make traditional dumplings in Xi'an, China",
  "Stay in a converted windmill in the Dutch countryside",
  "Take a beer-brewing workshop at a Trappist monastery in Belgium",
  "Participate in a traditional Polynesian navigation workshop in Hawaii"
];

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

    for (const activity of travelActivities) {
      // Generate embedding using OpenAI
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: activity
      });

      const embedding = response.data[0].embedding;

      // Store activity and embedding in database
      await client.query(
        'INSERT INTO travel_activity (activity, embedding) VALUES ($1, $2)',
        [activity, JSON.stringify(embedding)]
      );

      console.log(`Stored embedding for activity: ${activity.substring(0, 50)}...`);
    }

    console.log('All embeddings generated and stored!');
  } catch (err) {
    console.error('Error generating embeddings:', err);
  } finally {
    await client.end();
  }
}

generateEmbeddings();
```

## Part 4: Testing the Setup

1. First, run the database setup:

```bash
node setup.js
```

2. Then, generate and store the embeddings:

```bash
node load-embeddings.js
```

3. To verify everything worked, connect to the database and check the results:

```bash
psql -d embeddings_lab
```

Then run:

```sql
SELECT id,
       activity,
       substr(embedding::text, 1, 50) || '...' as truncated_embedding
FROM travel_activity;
```

Note that you can also use a basic `SELECT * FROM travel_activity;`, but the very long embeddings make the output difficult to use.

You should see your travel activities and their corresponding embeddings stored in the database.
## Next Steps

- Try adding more travel activities to the database
- Add an index to improve search performance
- Create a simple web interface for searching travel facts (we'll go over how searching works in the next lab, but you can get a head start by making a simple web interface!)
## Resources

- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [OpenAI Embeddings Documentation](https://platform.openai.com/docs/guides/embeddings)
- [Node-Postgres Documentation](https://node-postgres.com/) 