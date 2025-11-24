import { insertResourceSchema, resources } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { query } from '$app/server';

export const createResource = query(insertResourceSchema, async (input) => {
	try {
		const { content } = insertResourceSchema.parse(input);

		const [resource] = await db.insert(resources).values({ content }).returning();

		return 'Resource successfully created.';
	} catch (e) {
		if (e instanceof Error) return e.message.length > 0 ? e.message : 'Error, please try again.';
	}
});
