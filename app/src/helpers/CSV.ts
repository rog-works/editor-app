export default class CSV {
	public static stringify (body: any): string {
		return this._parse(body, '\n');
	}

	private static _parse (body: any, delemiter: string): string {
		if (Array.isArray(body)) {
			return body.map((self) => {
				return CSV._parse(self, ',');
			}).join(delemiter);
		} else if (typeof body === 'object') {
			let values = [];
			for (let key in body) {
				values.push(CSV._parse(body[key], ','));
			}
			return values.join(',');
		} else {
			return body;
		}
	}
}
