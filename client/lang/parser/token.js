'use strict';

class As {
	static is (as) {
		return new EBNFDefinition(as);
	}
}

class AsToken {
	static get is () {
		return As.is(AsToken)
			.any(
				AsTokenString,
				AsTokenNumeric,
				AsTokenKeyword,
				AsTokenIdentifer,
				AsTokenPunctuator
			);
	}

	static get included () {
		return true;
	}

	static toData (data) {
		return data;
	}
}

class AsTokenString {
	static get is () {
		return As.is(AsTokenString)
			.any(
				new AsEndSymbol(/'[^']*'/),
				new AsEndSymbol(/"[^"]*"/)
			);
	}

	static toData (data) {
		const raw = data[0];
		const value = raw.substr(1, data.length - 2);
		return {
			type: 'String',
			value: value,
			raw: raw
		};
	}
}

class AsTokenNumeric {
	static get is () {
		return As.is(AsTokenNumeric)
			.any(
				new AsEndSymbol(/0x[0-9a-fA-F]+/),
				new AsEndSymbol(/(0|[1-9])[0-9]*(\.[0-9]+)?/)
			);
	}

	static toData (data) {
		const raw = data[0];
		const isInt = /[0-9]+/.test(raw);
		const value = isInt ? parseInt(raw) : parseFloat(raw);
		return {
			type: 'Numeric',
			value: value,
			raw: raw
		};
	}
}

class AsTokenBoolean {
	static get is () {
		return As.is(AsTokenBoolean)
			.on(new AsEndSymbol(/false|true/));
	}

	static toData (data) {
		return {
			type: 'Boolean',
			value: data[0] === 'true',
			raw: data[0]
		};
	}
}

class AsTokenKeyword {
	static get is () {
		return As.is(AsTokenKeyword)
			.on(new AsEndSymbol(`this`));
	}

	static toData (data) {
		return {
			type: 'Keyword',
			value: data[0],
			raw: data[0]
		};
	}
}

class AsTokenIdentifer {
	static get is () {
		return As.is(AsTokenIdentifer)
			.on(new AsEndSymbol(/[a-zA-Z$_][0-9a-zA-Z$_]*/));
	}

	static toData (data) {
		return {
			type: 'Identifer',
			value: data[0],
			raw: data[0]
		};
	}
}

class AsTokenPunctuator {
	static get is () {
		return As.is(AsTokenPunctuator)
			.any(
				new AsEndSymbol(/<=|>=|==|!=/),
				new AsEndSymbol(/[&]{2}|[|]{2}/),
				new AsEndSymbol(/[\-=\/,.;:'"+*_&|^%!?(){}\[\]]/)
			);
	}

	static toData (data) {
		return {
			type: 'Punctuator',
			value: data[0],
			raw: data[0]
		};
	}
}

class AsTokenWhiteSpace {
	static get is () {
		return As.is(AsTokenWhiteSpace)
			.without(new AsEndSymbol(/[ \t\n]+/));
	}

	static get included () {
		return false;
	}

	static toData (data) {
		return {
			type: 'WhiteSpace'
		};
	}
}

class AsEndSymbol {
	constructor (subject) {
		this._regular = subject instanceof RegExp;
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
		const target = stream.peak();
		const match = this._subject.exec(target);
		if (match === null || match.index > 0) {
			return null;
		}
		const symbol = match[0];
		stream.seek(symbol.length);
		return symbol;
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
