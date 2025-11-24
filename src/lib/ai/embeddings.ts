import { embedMany } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { GOOGLE_GENERATIVE_AI_API_KEY } from '$env/static/private';

const google = createGoogleGenerativeAI({
	apiKey: GOOGLE_GENERATIVE_AI_API_KEY
});
const embeddingModel = google.textEmbedding('gemini-embedding-001');

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
