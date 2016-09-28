'use strict';

class TokenParser {
	constructor (plain) {
		this._stream = new Stream(plain);
	}

	execute () {
		return this._parse(this._stream, this._definitions());
	}

	_parse (stream, definitions) {
		const tokens = [];
		while (stream.available) {
			const exists = null;
			for (const definition of definitions) {
				const begin = stream.pos;
				const [err, results] = this._get(definition.is(), stream);
				if (err === null) {
					exists = results;
					break;
				} else {
					stream.seek(begin, 'begin');
				}
			}
			if (exists.length > 0) {
				tokens.push(...exists);
			} else {
				throw new Error('Failed parse token');
			}
		}
		return tokens;
	}

	_get (root, stream) {
		let err = null;
		const tokens = [];
		for (let i = 0; i < root.length; i += 1) {
			const statement = root[i];
			const hasNext = root.length > i + 1;
			const results = [];
			if (statement.type === 'if'
			 || statemejt.type === 'else') {
				[err, results] = this._get(statement, stream);
				// FIXME
				if (err !== null && hasNext) {
					if (['else', 'then'].indexOf(root[i + 1].type) !== -1) {
						err = null;
					}
				}
			} else if (statement.type === 'while') {
				[err, results] = this._get(statement, stream);
				// FIXME
				if (err !== null && hasNext) {
					err = null;
				}
			} else {
				if (typeof statement.dependecy === 'function') {
					[err, results] = this._get(statement.is(), stream);
				} else {
					const data = this._on(statement, stream);
					if (data !== null) {
						tokens.push(data);
					} else {
						err = new Error('Failed parse dependecy');
					}
				}
			}

			if (err !== null) {
				break;
			} else if (results.length > 0) {
				tokens.push(...results);
			}
		}
		return [err, tokens];
	}
	
	_on (statement, stream) {
		const data = statement.dependecy.parse(stream);
		if (data !== null) {
			return data;
		} else {
			return null;
		}
	}

	_definitions () {
		return [
			AsTokenIdentifer,
			AsTokenNumeric,
			AsTokenString,
			AsTokenPunctuator
		];
	}
}

class As {
	static is () {
		return new EBNFTree();
	}
}

class AsEndSymbol {
	constructor (matcher) {
		this._regular = typeof matcher === 'object';
		this._matcher = matcher;
	}

	parse (stream) {
		if (this._regular) {
			return this._parseRegular(stream);
		} else {
			return this._parseCompare(stream);
		}
	}

	_parseRegular (stream) {
		let symbol = '';
		while (stream.available) {
			const char = stream.peak(1);
			if (!this._matcher.test(symbol + char)) {
				break;
			}
			stream.seek(1);
			symbol += char;
		}
		return symbol.length > 0 ? symbol : null;
	}

	_parseCompare (stream) {
		const symbol = stream.peak(this._matcher.length);
		if (this._matcher !== symbol) {
			return null;
		}
		stream.seek(this._matcher.length);
		return symbol;
	}
}

class AsTokenIdentifer {
	static is () {
		return As.is()
			.on(new AsEndSymbol(/[a-zA-Z$_][0-9a-zA-Z$_:]*/));
	}
}

class AsTokenNumeric {
	static is () {
		return As.is()
			.on(new AsEndSymbol(/[0-9]+(\.[0-9]+)?/));
	}
}

class AsTokenString {
	static is () {
		return As.is()
			.on(new AsEndSymbol(/'.*'/));
	}
}

class AsTokenPunctuator {
	static is () {
		return As.is()
			.on(new AsEndSymbol(/<=|>=|==|!=|&&|[|]{2}|['\"().*/%+-&|^<>=]/));
	}
}
