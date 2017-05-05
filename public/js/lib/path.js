'use strict';

class Path {
	static join (...args) {
		const routes = [];
		for (const route of args) {
			routes.push(...route.split('/'));
		}
		const results = [];
		for (const route of routes) {
			if (route === '..') {
				results.pop();
			} else {
				results.push(route);
			}
		}
		return results.join('/').replace('//', '/');// XXX
	}
	
	static dirname (path) {
		return Path.join(path, '..');
	}
	
	static basename (path) {
		return path.split('/').pop();
	}
}
