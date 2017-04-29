export default class Path {
	public static join(...args: string[]): string {
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

	public static dirname(path: string): string {
		return Path.join(path, '..');
	}

	public static basename(path: string): string {
		return path.split('/').pop() || '';
	}

	public static extention(path: string): string {
		return path.substr(path.lastIndexOf('.') + 1);
	}

	public static valid(path: string): boolean {
		return !/[\\:*?"<>|]+/.test(path);
	}
}
