import { insertResourceSchema, resources } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { query } from '$app/server';
import { generateEmbeddings } from '$lib/ai/embeddings';
import { embeddings as embeddingTable } from '$lib/server/db/schema';

export const createResource = query(insertResourceSchema, async (input) => {
	try {
		const { content } = insertResourceSchema.parse(input);

		const [resource] = await db.insert(resources).values({ content }).returning();
		const embeddings = await generateEmbeddings(resource.content);
		await db.insert(embeddingTable).values(
			embeddings.map((embedding) => ({
				resourceId: resource.id,
				...embedding
			}))
		);

		return 'Resource successfully created and embedded.';
	} catch (e) {
		console.log('hello', e);
		if (e instanceof Error) return e.message.length > 0 ? e.message : 'Error, please try again.';
	}
});
