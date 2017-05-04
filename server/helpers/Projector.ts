export default class Projector {
	public static select(body: any, routes: string[]): any {
		if (Array.isArray(body)) {
			return body.map(self => this.select(self, routes));
		} else if (typeof body === 'object') {
			return this._assoc(this._plack(body, routes));
		} else {
			return body;
		}
	}

	private static _plack(obj: any, routes: string[]): any {
		let flattened: any = {};
		for (const route of routes) {
			let curr = obj;
			for (const key of route.split('.')) {
				if (key in curr) {
					curr = curr[key];
				} else {
					curr = obj;
					break;
				}
			}
			if (curr !== obj) {
				flattened[route] = curr;
			}
		}
		return flattened;
	}

	private static _assoc(flattened: any): any {
		let obj: any = {};
		for (const route in flattened) {
			const value = flattened[route];
			let curr = obj;
			let keys = route.split('.');
			const lastKey = keys.pop();
			for (const key of keys) {
				if (!(key in curr)) {
					// FIXME
					curr[key] = /^[\d]/.test(key) ? [] : {};
				}
				curr = curr[key];
			}
			if (lastKey) {
				curr[lastKey] = value;
			}
		}
		return obj;
	}
}
