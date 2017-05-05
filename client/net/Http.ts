import * as request from 'superagent';

export type Verbs = 'get' | 'post' | 'put' | 'delete';
export namespace Verbs {
	export const Get = 'get';
	export const Post = 'post';
	export const Put = 'put';
	export const Delete = 'delete';
}

export default class Http {
	public static send<T>(verb: Verbs, url: string, data: Object = {}): Promise<T> {
		console.log('Request', verb, url);
		return new Promise((resolve: Function, reject: Function) => {
			request[verb](url)
				.type('form')
				.send(data)
				.timeout(1500)
				.end((error: any, res: request.Response) => {
					if (error) {
						console.error('Failed request', verb, url, error, res);
						reject(error);
					} else {
						console.log('Respond', verb, url);
						resolve(res.body);
					}
				});
		});
	}

	public static get<T>(url: string, data: Object = {}): Promise<T> {
		return this.send<T>(Verbs.Get, url, data);
	}

	public static post<T>(url: string, data: Object = {}): Promise<T> {
		return this.send<T>(Verbs.Post, url, data);
	}

	public static put<T>(url: string, data: Object = {}): Promise<T> {
		return this.send<T>(Verbs.Put, url, data);
	}

	public static delete<T>(url: string, data: Object = {}): Promise<T> {
		return this.send<T>(Verbs.Delete, url, data);
	}
}
