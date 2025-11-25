<script lang="ts">
	import { Chat } from '@ai-sdk/svelte';
	import { DefaultChatTransport } from 'ai';

	let chat = new Chat({
		transport: new DefaultChatTransport({
			api: '/api/chat'
		})
	});
	let input = $state('');

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		chat.sendMessage({
			text: input
		});
		input = '';
	}
</script>

<div class="stretch mx-auto flex max-w-md flex-col py-24">
	<div class="space-y-4">
		{#each chat.messages as message, messageIdx (messageIdx)}
			<div class="whitespace-pre-wrap">
				<div>
					<div class="font-semibold">{message.role}</div>
					{#each message.parts as part}
						{#if part.type === 'text'}
							{part.text}
						{:else if part.type === 'tool-addResource' || part.type === 'tool-getInfo'}
							call{part.state === 'input-streaming' ? 'ing' : 'ed'}{' '}tool : {part.type}
							<pre class="my-4 rounded-sm bg-zinc-100 p-2">
                          {JSON.stringify(part.input, null, 2)}
                        </pre>
						{/if}
					{/each}
				</div>
			</div>
		{/each}
	</div>
	<form onsubmit={handleSubmit}>
		<input
			type="text"
			bind:value={input}
			placeholder="Say something"
			class="fixed bottom-0 mb-8 w-full max-w-md rounded-md border border-gray-300 p-2 shadow-xl"
		/>
	</form>
</div>
