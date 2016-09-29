'use strict';

class TokenParser {
	constructor (plain) {
		this._stream = new Stream(plain);
	}

	execute () {
		return this._parse(this._stream, this._definitions());
	}

	_definitions () {
		return [
			AsTokenIdentifer,
			AsTokenNumeric,
			AsTokenString,
			AsTokenPunctuator,
			AsTokenWhiteSpace
		];
	}

	_parse (stream, definitions) {
		const tokens = [];
		while (stream.available) {
			let exists = null;
			for (const definition of definitions) {
				const begin = stream.pos;
				const [err, results] = this._parseDefinition(definition.is(), stream);
				if (err === null) {
					exists = results;
					break;
				} else {
					stream.seek(begin, 'begin');
				}
			}
			if (exists === null) {
				throw new Error(`Failed parse definition`);
			} else if (exists.length > 0) {
				tokens.push(...exists);
			}
			if (!stream.available) {
				console.log('eof');
			}
		}
		return tokens;
	}

	_parseDefinition (root, stream) {
		const tokens = [];
		let ignore = null;
		for (const statement of root) {
			// ignore statement type XXX
			if (ignore !== null && ignore === statement.type) {
				continue;
			}
			ignore = null;

			// parse by definition
			let err = null;
			let results = null;
			console.log('DEF', statement.path, statement.dependecy);
			if (typeof statement.dependecy === 'function') {
				[err, results] = this._parseDefinition(statement.dependecy.is(), stream);
			} else if (statement.type in this) {
				[err, results, ignore] = this[statement.type](statement, stream);
			} else {
				throw new Error(`Unexpected dependecy. ${statement.dependecy}`);
			}

			if (err !== null) {
				return [err, tokens];
			} else if (results !== null && results.length > 0) {
				tokens.push(...results);
			}
		}
		return [null, tokens];
	}

	if (statement, stream) {
		const [err, results] = this._parseDefinition(statement, stream);
		// XXX
		let ignore = null;
		if (err !== null && statement.hasNext) {
			err = null;
		} else {
			ignore = 'else';
		}
		return [err, results, ignore];
	}

	else (statement, stream) {
		return this.if(statement, stream);
	}

	while (statement, stream) {
		const [err, results] = this._parseDefinition(statement, stream);
		// XXX
		if (err !== null && statement.hasNext) {
			err = null;
		}
		return [err, results, null];
	}

	without (statement, stream) {
		const [err] = this._parseDefinition(statement, stream);
		return [err, null, null];
	}

	on (statement, stream) {
		let dependecy = statement.dependecy;
		if (typeof dependecy === 'string') {
			dependecy = new AsEndSymbol(dependecy);
		} else if (typeof dependecy === 'object' && dependecy.constructor === RegExp) {
			dependecy = new AsEndSymbol(dependecy);
		}
		const data = dependecy.parse(stream);
		let err = null;
		if (data === null) {
			err = new Error(`Failed parse dependecy. ${dependecy}`);
		}
		return [err, [data], null];
	}
}

class As {
	static is () {
		return new EBNFTree();
	}
}

class AsEndSymbol {
	constructor (subject) {
		this._regular = typeof subject === 'object';
		this._subject = subject;
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
			const next = symbol + stream.peak(1);
			const matches = next.match(this._subject);
			console.log('END', 'subject:', this._subject, 'matched:', `"${symbol}"`, 'target:', `"${next}"`, 'results:', matches);
			if (matches === null || matches[0].length < next.length) {
				break;
			}
			stream.seek(1);
			symbol = next;
		}
		console.log('END', 'returned:', `"${symbol}"`);
		return symbol.length > 0 ? symbol : null;
	}

	_parseCompare (stream) {
		const symbol = stream.peak(this._subject.length);
		if (this._subject !== symbol) {
			return null;
		}
		stream.seek(this._subject.length);
		return symbol;
	}
}

class AsTokenIdentifer {
	static is () {
		return As.is()
			.on(/[a-zA-Z$_][0-9a-zA-Z$_]*/);
	}
}

class AsTokenNumeric {
	static is () {
		return As.is()
			.on(/[0-9]+(\.[0-9]+)?/);
	}
}

class AsTokenString {
	static is () {
		return As.is()
			.on(/'.*'/);
	}
}

class AsTokenPunctuator {
	static is () {
		return As.is()
			.any(
				/<=|>=|==|!=/,
				/[&]{2}|[|]{2}/,
				/[\-=\/,.;:'"+*_&|^%!?(){}\[\]]/
			);
	}
}

class AsTokenWhiteSpace {
	static is () {
		return As.is()
			.without(/[ \t\n]+/);
	}
}
