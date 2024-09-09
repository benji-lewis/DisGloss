export interface Env {
	// If you set another name in wrangler.toml as the value for 'binding',
	// replace "DB" with the variable name you defined.
	DB: D1Database;
}

async function getQueryParams(request:Request, param:string):Promise<string> {
	const { searchParams } = new URL(request.url)
	let value = searchParams.get(param)
	if (!value) throw new Error("Missing required parameter: " + param);
	return value;
}

export default {
	async fetch(request, env): Promise<Response> {
		const { pathname, searchParams } = new URL(request.url);

		if (pathname === "/api/definition") {
			const term = searchParams.get("term");
			const serverId = searchParams.get("serverId");
			console.group("Query String");
			console.log("term", term);
			console.log("serverId", serverId);
			console.groupEnd();
			const { results } = await env.DB.prepare("SELECT * FROM Glossary WHERE ServerId = ? and Term = ?")
				.bind(serverId, term)
				.all();
			console.log("Results", results);
			return Response.json(results);
		}

		return new Response("Unrecognized request", {
			status: 400,
			statusText: "Bad Request"
		});
	},
} satisfies ExportedHandler<Env>;