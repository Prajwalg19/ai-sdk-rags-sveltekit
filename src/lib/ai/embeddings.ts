import { embedMany } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { GOOGLE_GENERATIVE_AI_API_KEY } from '$env/static/private';
import { cosineDistance, sql, gt, desc } from 'drizzle-orm';
import { embeddings } from '$lib/server/db/schema';
import { db } from '$lib/server/db';

const google = createGoogleGenerativeAI({
	apiKey: GOOGLE_GENERATIVE_AI_API_KEY
});
const embeddingModel = google.textEmbedding('text-embedding-004');

export const generateChunks = (input: string): Array<string> => {
	return input
		.trim()
		.split('.')
		.filter((s) => s !== '');
};

export const generateEmbeddings = async (value: string) => {
	const chunks = generateChunks(value);
	const { embeddings } = await embedMany({
		model: embeddingModel,
		values: chunks
	});

	return embeddings.map((e, i) => ({ embedding: e, content: chunks[i] }));
};

export const findRelevantContent = async (userQuery: string) => {
	const userQueryEmbedded = await generateEmbeddings(userQuery);
	const similarity = sql<number>`1 - (${cosineDistance(embeddings.embedding, userQueryEmbedded)})`;
	const similarGuides = await db
		.select({ name: embeddings.content, similarity })
		.from(embeddings)
		.where(gt(similarity, 0.5))
		.orderBy((t) => desc(t.similarity))
		.limit(4);
	return similarGuides;
};
