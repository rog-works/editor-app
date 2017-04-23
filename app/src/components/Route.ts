type Verbs = 'get' | 'post' | 'put' | 'delete';
namespace Verbs {
	export const Get = 'get';
	export const Post = 'post';
	export const Put = 'put';
	export const Delete = 'delete';
}

export default class Route {
	private constructor(
		public method: Verbs,
		public path: string,
		public on: string = 'index',
		public args: string[] = []
	) {}

	public static get(path: string): RouteBuilder {
		return new RouteBuilder(new this(Verbs.Get, path));
	}

	public static post(path: string): RouteBuilder {
		return new RouteBuilder(new this(Verbs.Post, path));
	}

	public static put(path: string): RouteBuilder {
		return new RouteBuilder(new this(Verbs.Put, path));
	}

	public static delete(path: string): RouteBuilder {
		return new RouteBuilder(new this(Verbs.Delete, path));
	}
}

class RouteBuilder {
	public constructor(
		private _route: Route
	) {}

	public path(path: string): this {
		this._route.path = path;
		return this;
	}

	public params(key: string): this {
		this._route.args.push(`params.${key}`);
		return this;
	}

	public query(key: string): this {
		this._route.args.push(`query.${key}`);
		return this;
	}

	public body(key: string): this {
		this._route.args.push(`body.${key}`);
		return this;
	}

	public on(listen: string): Route {
		this._route.on = listen;
		return this._route;
	}
}
