export default class Manipulate {
	public static extend(dist: any, ...srcs: any[]): any {
		for (const src of srcs) {
			dist = this._extend(dist, src);
		}
		return dist;
	}

	private static _extend(dist: any, src: any): any {
		if (!Array.isArray(src) && src && typeof src === 'object') {
			for (const key in src) {
				if ((key in dist) && !Array.isArray(dist[key]) && dist[key] && typeof dist[key] === 'object') {
					dist[key] = this.extend(dist[key], src[key]);
				} else {
					dist[key] = src[key];
				}
			}
		} else {
			throw new Error(`Invalid arguments. ${src}`);
		}
		return dist;
	}

	public static createObject(route: string, value: any): any {
		let json = JSON.stringify(value);
		for (const key of route.split('.').reverse()) {
			json = `{"${key}":${json}}`;
		}
		return JSON.parse(json);
	}

	public static evaluate<T>(context: any, script: string): T {
		return eval(`(function f($){ return ${script}; })`)(context);
	}
}
