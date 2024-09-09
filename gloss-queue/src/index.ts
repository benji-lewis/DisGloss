export interface Env {
	defQueue: Queue<any>;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		let log = {
			url: request.url,
			method: request.method,
			headers: Object.fromEntries(request.headers),
		};
		await env.defQueue.send(log);
		return new Response('Success!');
	},
	async queue(batch, env): Promise<void> {
		let messages = JSON.stringify(batch.messages);
		console.log(`consumed from our queue: ${messages}`);
	},
} satisfies ExportedHandler<Env>;