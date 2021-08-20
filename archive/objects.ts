export class Metrics implements DurableObject {
	constructor(private state: DurableObjectState, env) {}

	async fetch(request: Request) {
		let url = new URL(request.url);

		switch (url.pathname) {
			case '/put_metric': {
				const data = await request.json();
				await this.state.storage.put(`id-${data.id}`, data);
				return new Response(JSON.stringify(data));
			}
			case '/list': {
				return new Response(
					JSON.stringify(
						await this.state.storage.list({ prefix: 'id-*' }),
					),
				);
			}
		}

		return new Response('not-found');
	}
}
