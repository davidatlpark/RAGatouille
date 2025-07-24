import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { RecipeRetriever } from "./retriever";
import * as readline from "readline";
import dotenv from "dotenv";

dotenv.config();

// Initialize LangChain components
const llm = new ChatOpenAI({
  modelName: "gpt-4.1-nano",
  temperature: 0.7,
  maxTokens: 500,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// Initialize the custom retriever
const retriever = new RecipeRetriever(3);

// Create prompt template
const promptTemplate = PromptTemplate.fromTemplate(`
You are a helpful professional chef. Use the following relevant recipes to answer the user's question. 
If the recipes aren't relevant to the question, you can say so.

Available Recipes:
{context}

Question: {question}

Please provide a helpful response based on these recipes and your general knowledge about cooking.
`);

// Helper function to format documents
function formatDocs(docs: any[]) {
  return docs
    .map(
      (doc) =>
        `- ${doc.pageContent} (Similarity: ${doc.metadata.similarity.toFixed(
          2
        )})`
    )
    .join("\n");
}

// Create the RAG chain with retriever
const ragChain = RunnableSequence.from([
  {
    context: retriever.pipe(formatDocs),
    question: new RunnablePassthrough(),
  },
  promptTemplate,
  llm,
  new StringOutputParser(),
]);

export async function askRecipeQuestion(question: string): Promise<string> {
  try {
    const result = await ragChain.invoke(question);
    return result;
  } catch (error) {
    console.error("Error in LangChain RAG:", error);
    throw error;
  }
}

// CLI Interface
async function startCLI() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("🍳 Recipe RAG Assistant");
  console.log('Ask me anything about recipes! (type "exit" to quit)\n');

  const askQuestion = () => {
    rl.question("Your question: ", async (question) => {
      if (question.toLowerCase() === "exit") {
        console.log("👋 Goodbye!");
        rl.close();
        return;
      }

      if (question.trim() === "") {
        console.log("Please enter a question.\n");
        askQuestion();
        return;
      }

      try {
        console.log("\n🔍 Searching recipes...");
        const answer = await askRecipeQuestion(question);
        console.log(`\n✨ Answer: ${answer}\n`);
        console.log("-".repeat(60) + "\n");
      } catch (error) {
        console.error("❌ Error:", error);
      }

      askQuestion();
    });
  };

  askQuestion();
}

// Run CLI if this file is executed directly
if (require.main === module) {
  startCLI().catch(console.error);
}
