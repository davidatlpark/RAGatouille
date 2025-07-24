import { VectorSearch } from './vector-search';
import * as fs from 'fs';
import * as path from 'path';

interface Embedding {
  activity: string;
  embedding: number[];
}

// Load sample embeddings from an external file (e.g., embeddings.json)
let data = fs.readFileSync(path.join(__dirname, 'sample-embeddings.json'), 'utf-8');
let embeddings: Embedding[] = JSON.parse(data);

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