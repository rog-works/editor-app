export default class Convert {
	public static snakelize(str: string): string {
		let ret = '';
		for (const c of str) {
			ret += /[A-Z]/.test(c) ? `_${c.toLowerCase()}` : c;
		}
		return ret.replace(/^_/, '');
	}

	public static camelize(str: string): string {
		return str.split('_').map((word) => `${word[0].toUpperCase()}${word.substr(1).toLowerCase()}`).join('');
	}
}