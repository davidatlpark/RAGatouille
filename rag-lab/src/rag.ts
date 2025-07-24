import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { searchSimilarRecipe } from './search';
import dotenv from 'dotenv';

dotenv.config();

// Initialize LangChain components
const llm = new ChatOpenAI({
    modelName: 'gpt-4.1-nano',
    temperature: 0.7,
    maxTokens: 500,
    openAIApiKey: process.env.OPENAI_API_KEY,
});

// Create prompt template
const promptTemplate = PromptTemplate.fromTemplate(`
You are a helpful professional chef. Use the following relevant recipes to answer the user's question. 
If the recipes aren't relevant to the question, you can say so.

Available Recipes:
{context}

Question: {question}

Please provide a helpful response based on these recipes and your general knowledge about cooking.
`);

// Create the RAG chain
const ragChain = RunnableSequence.from([
    {
        context: async (input: { question: string }) => {
            const searchResults = await searchSimilarRecipe(input.question, 3);
            
            if (searchResults.length === 0) {
                return "No relevant recipes found.";
            }
            
            return searchResults
                .map(result => `- ${result.title} (Similarity: ${result.similarity.toFixed(2)})`)
                .join('\n');
        },
        question: (input: { question: string }) => input.question,
    },
    promptTemplate,
    llm,
    new StringOutputParser(),
]);

// Keep the same function name so your existing code works
export async function askRecipeQuestion(question: string): Promise<string> {
    try {
        const result = await ragChain.invoke({ question });
        return result;
    } catch (error) {
        console.error('Error in LangChain RAG:', error);
        throw error;
    }
}