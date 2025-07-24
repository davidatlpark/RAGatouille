import { askRecipeQuestion } from './rag';

async function main() {
    // Example recipe-related questions
    const questions = [
        "What are some meals with chicken?",
        "What are some low calorie meals?",
        "What are some vegetarian meals?",
        "What are some hot desserts?"
    ];

    for (const question of questions) {
        console.log('\nQuestion:', question);
        const answer = await askRecipeQuestion(question);
        console.log('Answer:', answer);
        console.log('-'.repeat(80));
    }
}

main().catch(console.error);