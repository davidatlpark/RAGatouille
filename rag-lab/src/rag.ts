import OpenAI from 'openai';
import { searchSimilarRecipe } from './search';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function askRecipeQuestion(question: string): Promise<string> {
    try {
        // 1. Find relevant recipes
        const searchResults = await searchSimilarRecipe(question, 3);
        
        if (searchResults.length === 0) {
            return "I couldn't find any relevant recipes to answer your question.";
        }
        
        // 2. Format context from search results
        const context = searchResults
            .map(result => `- ${result.title} (Similarity: ${result.similarity.toFixed(2)})`)
            .join('\n');
        
        // 3. Create prompt with context
        const prompt = `You are a helpful professional chef. Use the following relevant recipes to answer the user's question. If the recipes aren't relevant to the question, you can say so.

Available Recipes:
${context}

Question: ${question}

Please provide a helpful response based on these recipes and your general knowledge about cooking.`;
        
        // 4. Get response from OpenAI
        const completion = await openai.chat.completions.create({
            model: 'gpt-4.1-nano',
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