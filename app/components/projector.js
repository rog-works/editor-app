'use strict';

class Projector {
	static select (body, routes) {
		if (Array.isArray(body)) {
			return body.map((self) => {
					return Projector.select(self, routes);
				});
		} else if (typeof body === 'object') {
			return Projector._assoc(Projector._plack(body, routes));
		} else {
			return body;
		}
	}

	static _plack (obj, routes) {
		let flattened = {};
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

	static _assoc (flattened) {
		let obj = {};
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
			curr[lastKey] = value;
		}
		return obj;
	}
}

module.exports = Projector;