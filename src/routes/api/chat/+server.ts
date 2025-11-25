import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { GOOGLE_GENERATIVE_AI_API_KEY } from '$env/static/private';
import { convertToModelMessages, streamText, type UIMessage, tool, stepCountIs } from 'ai';
import * as z from 'zod';
import { createResource } from '$lib/api/resource.remote.js';
import { findRelevantContent } from '$lib/ai/embeddings.js';

const google = createGoogleGenerativeAI({
	apiKey: GOOGLE_GENERATIVE_AI_API_KEY
});

export const POST = async ({ request }) => {
	const { messages }: { messages: UIMessage[] } = await request.json();
	const result = streamText({
		model: google('gemini-2.0-flash'),
		system:
			"You are a helpful assistant. Check your knowledge base before answering any questions. Only respond to questions using information from tool calls. If no relevant information is found in the tool calls, respond with 'Sorry I don't know'",
		messages: convertToModelMessages(messages),
		tools: {
			addResource: tool({
				description: `add resource to your knowledge base.
If the user provides a random piece of knowledge unprompted, use this tool without asking for any confirmation.`,
				inputSchema: z.object({
					content: z.string().describe('the content or resource to add to the knowledge base')
				}),
				execute: async ({ content }) => createResource({ content })
			}),
			getInformation: tool({
				description: `get information from your knowledge base to answer questions.`,
				inputSchema: z.object({
					question: z.string().describe('the users question')
				}),
				execute: async ({ question }) => findRelevantContent(question)
			})
		},
		stopWhen: stepCountIs(5)
	});

	return result.toUIMessageStreamResponse();
};
