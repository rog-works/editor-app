'use strict';

class CSV {
	static stringify (body) {
		return CSV._parse(body, '\n');
	}

	static _parse (body, delemiter) {
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
};

module.exports = CSV;
