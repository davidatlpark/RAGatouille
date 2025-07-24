"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const vector_search_1 = require("./vector-search");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Load sample embeddings from an external file (e.g., embeddings.json)
let data = fs.readFileSync(path.join(__dirname, 'sample-embeddings.json'), 'utf-8');
let embeddings = JSON.parse(data);
// Create an instance of VectorSearch
const vectorSearch = new vector_search_1.VectorSearch();
// Run a test for using `findSimilar`
function testFindSimilar() {
    return __awaiter(this, void 0, void 0, function* () {
        const sample = embeddings[0];
        const embedding = sample.embedding; // Use the embedding of the first activity
        console.log(`Test: Find Most Similar Activities using sample activity:\n ${sample.activity}`);
        const results = yield vectorSearch.findSimilar(embedding);
        console.log('Results:', results);
    });
}
// Run a test for finding similar above a threshold
function testFindSimilarAboveThreshold() {
    return __awaiter(this, void 0, void 0, function* () {
        const sample = embeddings[0];
        const embedding = sample.embedding;
        const threshold = 0.4; // Example threshold value for similarity
        console.log(`Test: Find Similar Activities Above Threshold (${threshold}) using sample activity:\n ${sample.activity}`);
        const results = yield vectorSearch.findSimilarAboveThreshold(embedding);
        console.log('Results:\n', results);
    });
}
// Run a test for finding similar winter activities (e.g., skiing, snowboarding)
function testFindSimilarWinterActivities() {
    return __awaiter(this, void 0, void 0, function* () {
        const sample = embeddings[0];
        const embedding = sample.embedding;
        console.log('Type of embeddings: ', typeof embedding);
        console.log(`Test: Find Similar Winter Activies using sample activity:\n ${sample.activity}`);
        const results = yield vectorSearch.findSimilarWinterActivities(embedding);
        console.log('Results:\n', results);
    });
}
// Run a test for finding similar to multiple reference activities
function testFindSimilarToMultiple() {
    return __awaiter(this, void 0, void 0, function* () {
        const referenceActivities = embeddings.slice(0, 2); // Use the first two activities as reference
        const referenceEmbeddings = referenceActivities.map(activity => activity.embedding);
        console.log(`Test: Find Similar to Multiple Reference Activities:\n1. ${referenceActivities[0].activity}\n2. ${referenceActivities[1].activity}`);
        const results = yield vectorSearch.findSimilarToMultiple(referenceEmbeddings);
        console.log('Results:\n', results);
    });
}
// Run all tests
function runTests() {
    return __awaiter(this, void 0, void 0, function* () {
        yield testFindSimilar();
        yield testFindSimilarAboveThreshold();
        yield testFindSimilarWinterActivities();
        yield testFindSimilarToMultiple();
    });
}
// Execute tests
runTests().catch(console.error);
