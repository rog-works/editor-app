'use strict';

class TokenParser {
	constructor (plain) {
		this._stream = new Stream(plain);
	}

	execute () {
		return this._parse(this._stream, this._definitions());
	}

	// XXX
	_definitions () {
		return [
			AsTokenString.is,
			AsTokenNumeric.is,
			AsTokenIdentifer.is,
			AsTokenPunctuator.is,
			AsTokenWhiteSpace.is
		];
	}

	_parse (stream, definitions) {
		console.log('PARSE', 'source:', stream.source);
		const data = [];
		while (stream.available) {
			const beginAvailable = stream.available;
			const parseData = [];
			for (const definition of definitions) {
				const begin = stream.pos;
				const result = this._parseDefinition(definition.root, stream);
				if (result.matched) {
					if (definition.from.included) {
						parseData.push(definition.from.toData(result.data));
					}
					break;
				} else {
					stream.seek(begin, 'begin');
				}
			}
			if (stream.available === beginAvailable) {
				throw new Error('Unmatch deinitions');
			}
			if (parseData.length > 0) {
				console.log('ADD', 'data:', parseData);
				data.push(...parseData);
			}
		}
		return data;
	}

	_parseDefinition (statements, stream) {
		let result = this._result([]);
		for (const statement of statements) {
			// ignore statement type XXX
			if (result.then) {
				if (statement.type === 'else') {
					continue;
				}
			}

			// run the statement XXX
			console.log('DEF', 'path:', statement.path, 'depends:', statement.dependecy);
			let inResult = null;
			if (typeof statement.dependecy === 'function') {
				inResult = this._parseDefinition(statement.dependecy.is, stream);
			} else if (statement.type in this) {
				inResult = this[statement.type](statement, stream);
			} else {
				throw new Error(`Unexpected statement. ${statement}`);
			}

			// unmatch to exit
			if (!inResult.matched) {
				return this._result();
			}

			// merge result
			result.data.push(...inResult.data);
			result.then = inResult.then;
		}
		return result;
	}

	if (statement, stream) {
		const {matched, data} = this._parseDefinition(statement, stream);
		// XXX
		if (statement.hasNext) {
			if (matched) {
				console.log('IFt', 'path:', statement.path, 'hasNext:', statement.hasNext);
				return this._result(data, true);
			} else {
				console.log('IFf', 'path:', statement.path, 'hasNext:', statement.hasNext);
				return this._result([]);
			}
		}
		return this._result(data);
	}

	else (statement, stream) {
		return this.if(statement, stream);
	}

	while (statement, stream) {
		let data = [];
		while (true) {
			const {matched, inData} = this._parseDefinition(statement, stream);
			if (matched) {
				data.push(...inData);
			} else {
				break;
			}
		}
		return this._result(data);
	}

	without (statement, stream) {
		const {matched} = this._parseDefinition(statement, stream);
		return this._result(matched ? [] : null);
	}

	on (statement, stream) {
		let dependecy = statement.dependecy;
		if (typeof dependecy === 'string') {
			dependecy = new AsEndSymbol(dependecy);
		} else if (typeof dependecy === 'object' && dependecy.constructor === RegExp) {
			dependecy = new AsEndSymbol(dependecy);
		} else {
			throw new Error(`Unexpected dependecy. ${dependecy}`);
		}
		const data = dependecy.parse(stream);
		return this._result(data !== null ? [data] : null);
	}

	_result (data = null, then = false) {
		return {
			matched: data !== null,
			data: data,
			then: then
		};
	}
}

class As {
	static is (as) {
		return new EBNFDefinition(as);
	}
}

class AsTokenString {
	static get is () {
		return As.is(AsTokenString)
			  .if(`'`, /[^']*/, `'`)
			.else(`"`, /[^"]*/, `"`);
	}

	static get included () {
		return true;
	}

	static toData (data) {
		const raw = data.join('');
		return {
			type: 'string',
			value: raw.split(/['"]/).join(''),
			raw: raw
		};
	}
}

class AsTokenNumeric {
	static get is () {
		return As.is(AsTokenNumeric)
			.on(/(0|[1-9])[0-9]*(\.[0-9]+)?/);
	}

	static get included () {
		return true;
	}

	static toData (data) {
		const number = data[0];
		const isInt = /[0-9]+/.test(number);
		const value = isInt ? parseInt(number) : parseFloat(number);
		return {
			type: 'numeric',
			value: value,
			raw: data[0]
		};
	}
}

class AsTokenIdentifer {
	static get is () {
		return As.is(AsTokenIdentifer)
			.on(/[a-zA-Z$_][0-9a-zA-Z$_]*/);
	}

	static get included () {
		return true;
	}

	static toData (data) {
		return {
			type: 'identifer',
			value: data[0],
			raw: data[0]
		};
	}
}

class AsTokenPunctuator {
	static get is () {
		return As.is(AsTokenPunctuator)
			.any(
				/<=|>=|==|!=/,
				/[&]{2}|[|]{2}/,
				/[\-=\/,.;:'"+*_&|^%!?(){}\[\]]/
			);
	}

	static get included () {
		return true;
	}

	static toData (data) {
		return {
			type: 'punctuator',
			value: data[0],
			raw: data[0]
		};
	}
}

class AsTokenWhiteSpace {
	static get is () {
		return As.is(AsTokenWhiteSpace)
			.without(/[ \\t\\n]+/);
	}

	static get included () {
		return false;
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
			console.log('REG', 'subject:', this._subject, 'matched:', `"${symbol}"`, 'target:', `"${next}"`, 'results:', matches);
			if (matches === null || matches[0].length < next.length) {
				break;
			}
			stream.seek(1);
			symbol = next;
		}
		console.log('REG', 'returned:', `"${symbol}"`);
		return symbol.length > 0 ? symbol : null;
	}

	_parseCompare (stream) {
		const symbol = stream.peak(this._subject.length);
		console.log('CMP', 'subject:', this._subject, 'target:', `"${symbol}"`, 'results:', (this._subject === this.name));
		if (this._subject !== symbol) {
			console.log('CMP', 'returned:', `null`);
			return null;
		}
		stream.seek(this._subject.length);
		console.log('END', 'returned:', `"${symbol}"`);
		return symbol;
	}
}
