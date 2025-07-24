import { BaseRetriever } from "@langchain/core/retrievers";
import { Document } from "@langchain/core/documents";
import { searchSimilarRecipe } from "./search";

export class RecipeRetriever extends BaseRetriever {
  lc_namespace = ["recipe", "retrievers"];

  constructor(private limit: number = 5) {
    super();
  }

  async _getRelevantDocuments(query: string): Promise<Document[]> {
    const searchResults = await searchSimilarRecipe(query, this.limit);

    return searchResults.map(
      (result) =>
        new Document({
          pageContent: result.title,
          metadata: {
            similarity: result.similarity,
            type: "recipe",
          },
        })
    );
  }
}
