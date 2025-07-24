"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorSearch = void 0;
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "mysecretpassword",
    database: "embeddings_lab",
});
class VectorSearch {
    findSimilar(embedding_1) {
        return __awaiter(this, arguments, void 0, function* (embedding, limit = 5) {
            const query = `
      SELECT
        id,
        activity,
        1 - (embedding <=> $1::vector) AS similarity
      FROM travel_activity
      ORDER BY similarity DESC
      LIMIT $2;
    `;
            const result = yield pool.query(query, [embedding, limit]);
            return result.rows;
        });
    }
    findSimilarAboveThreshold(embedding_1) {
        return __awaiter(this, arguments, void 0, function* (embedding, threshold = 0.5, limit = 5) {
            const query = `
      SELECT 
        id, activity, 
        1 - (embedding <=> $1::vector) AS similarity
      FROM travel_activity
      WHERE 1 - (embedding <=> $1::vector) > $2
      ORDER BY similarity DESC
      LIMIT $3;
    `;
            // Pass the embedding directly as an array (no need to stringify)
            const result = yield pool.query(query, [embedding, threshold, limit]);
            return result.rows;
        });
    }
    findSimilarWinterActivities(embedding_1) {
        return __awaiter(this, arguments, void 0, function* (embedding, limit = 5) {
            const query = `
      SELECT 
        id, activity, 
        1 - (embedding <=> $1::vector) AS similarity
      FROM travel_activity
      WHERE activity ILIKE ANY (ARRAY['%snow%', '%ski%', '%ice%', '%winter%', '%sled%', '%cold%', '%frozen%'])
      ORDER BY similarity DESC
      LIMIT $2;
    `;
            const result = yield pool.query(query, [embedding, limit]);
            return result.rows;
        });
    }
    findSimilarToMultiple(embeddings_1) {
        return __awaiter(this, arguments, void 0, function* (embeddings, limit = 5) {
            // Compute the average vector
            const avgEmbedding = embeddings[0].map((_, i) => embeddings.reduce((sum, vec) => sum + vec[i], 0) / embeddings.length);
            const query = `
      SELECT id, activity, 
             1 - (embedding <=> $1::vector) AS similarity
      FROM travel_activity
      ORDER BY similarity DESC
      LIMIT $2;
    `;
            const result = yield pool.query(query, [avgEmbedding, limit]);
            return result.rows;
        });
    }
}
exports.VectorSearch = VectorSearch;
