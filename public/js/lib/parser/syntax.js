'use strict';

// const parser = new BinaryParser(new Schema(json));
// parser.deserialize();

class AsEndToken {
	constructor (type, subject) {
		this._type = type;
		this._skipMatch = subject === null;
		this._regular = subject instanceof RegExp;
		this._subject = subject;
	}

	parse (stream) {
		if (!stream.available) {
			return null;
		}
		const token = stream.peak(1)[0];
		if (this._type !== token.type) {
			return null;
		}
		// XXX
		if (!this._skipMatch) {
			if (this._regular) {
				if (!this._subject.test(token.raw)) {
					return null;
				}
			} else {
				if (this._subject !== token.raw) {
					return null;
				}
			}
		}
		stream.seek(1);
		return token;
	}
}

class AsExpression {
	static get is () {
		return As.is(AsExpression)
			.on(
				AsLogicalOrExpression
			);
	}

	static get included () {
		return true;
	}

	static toData (data) {
		return data;
	}
}

class AsLogicalOrExpression {
	static get is () {
		return As.is(AsLogicalOrExpression)
			.on(
				AsLogicalAndExpression
			)
			.option(
				new AsOperator(`||`),
				AsLogicalAndExpression
			);
	}

	static toData (data) {
		if (data.length === 1) {
			return data;
		}
		return {
			type: 'LogicalExpression',
			left: data[0],
			operator: data[1],
			right: data[2]
		};
	}
}

class AsLogicalAndExpression {
	static get is () {
		return As.is(AsLogicalAndExpression)
			.on(
				// AsBitwiseOrExpression
				AsLeftHandSideExpression
			)
			.option(
				new AsOperator(`&&`),
				// AsBitwiseOrExpression
				AsLeftHandSideExpression
			);
	}

	static toData (data) {
		if (data.length === 1) {
			return data;
		}
		return {
			type: 'LogicalExpression',
			left: data[0],
			operator: data[1],
			right: data[2]
		};
	}
}

class AsBitwiseOrExpression {
	static get is () {
		return As.is(AsBitwiseOrExpression)
			.on(
				AsBitwiseXorExpression
			)
			.option(
				new AsOperator(`|`),
				AsBitwiseXorExpression
			);
	}

	static toData (data) {
		if (data.length === 1) {
			return data;
		}
		return {
			type: 'BinaryExpression',
			left: data[0],
			operator: data[1],
			right: data[2]
		};
	}
}

class AsBitwiseXorExpression {
	static get is () {
		return As.is(AsBitwiseXorExpression)
			.on(
				AsBitwiseAndExpression
			)
			.option(
				new AsOperator(`^`),
				AsBitwiseAndExpression
			);
	}

	static toData (data) {
		if (data.length === 1) {
			return data;
		}
		return {
			type: 'BinaryExpression',
			left: data[0],
			operator: data[1],
			right: data[2]
		};
	}
}

class AsBitwiseAndExpression {
	static get is () {
		return As.is(AsBitwiseAndExpression)
			.on(
				AsEqualityExpression
			)
			.option(
				new AsOperator(`&`),
				AsEqualityExpression
			);
	}

	static toData (data) {
		if (data.length === 1) {
			return data;
		}
		return {
			type: 'BinaryExpression',
			left: data[0],
			operator: data[1],
			right: data[2]
		};
	}
}

class AsEqualityExpression {
	static get is () {
		return As.is(AsEqualityExpression)
			.on(
				AsRelationalExpression
			)
			.option(
				new AsOperator(/==|!=/),
				AsRelationalExpression
			);
	}

	static toData (data) {
		if (data.length === 1) {
			return data;
		}
		return {
			type: 'BinaryExpression',
			left: data[0],
			operator: data[1],
			right: data[2]
		};
	}
}

class AsRelationalExpression {
	static get is () {
		return As.is(AsRelationalExpression)
			.on(
				AsAdditiveExpression
			)
			.option(
				new AsOperator(/<|<=|>|>=/),
				AsAdditiveExpression
			);
	}

	static toData (data) {
		if (data.length === 1) {
			return data;
		}
		return {
			type: 'BinaryExpression',
			left: data[0],
			operator: data[1],
			right: data[2]
		};
	}
}

class AsAdditiveExpression {
	static get is () {
		return As.is(AsAdditiveExpression)
			.on(
				AsMultiplicativeExpression
			)
			.option(
				new AsOperator(/[+-]/),
				AsMultiplicativeExpression
			);
	}

	static toData (data) {
		if (data.length === 1) {
			return data;
		}
		return {
			type: 'BinaryExpression',
			left: data[0],
			operator: data[1],
			right: data[2]
		};
	}
}

class AsMultiplicativeExpression {
	static get is () {
		return As.is(AsMultiplicativeExpression)
			.on(
				AsLeftHandSideExpression
			)
			.option(
				new AsOperator(/[*/%]/),
				AsLeftHandSideExpression
			);
	}

	static toData (data) {
		if (data.length === 1) {
			return data;
		}
		return {
			type: 'BinaryExpression',
			left: data[0],
			operator: data[1],
			right: data[2]
		};
	}
}

class AsLeftHandSideExpression {
	static get is () {
		return As.is(AsLeftHandSideExpression)
			.any(
				AsCallExpression,
				AsMemberExpression
			)
	}

	static toData (data) {
		return data;
	}
}

class AsCallExpression {
	static get is () {
		return As.is(AsCallExpression)
			.on(
				AsMemberExpression,
				AsArguments
			);
	}

	static toData (data) {
		return {
			type: 'CallExpression',
			callee: data.shift(),
			arguments: data
		};
	}
}

class AsArguments {
	static get is () {
		return As.is(AsArguments)
			.on(
				new AsPunctuator(`(`)
			)
			.option(
				AsArgumentList
			)
			.on(
				new AsPunctuator(`)`)
			);
	}

	static toData (data) {
		return data.filter((token) => {
			return token.type !== 'Punctuator';
		});
	}
}

class AsArgumentList {
	static get is () {
		return As.is(AsArgumentList)
			.on(
				AsLogicalOrExpression
			)
			.while(
				new AsPunctuator(`,`),
				AsLogicalOrExpression
			);
	}

	static toData (data) {
		return data.filter((token) => {
			return token.type !== 'Punctuator';
		});
	}
}

class AsMemberExpression {
	static get is () {
		return As.is(AsMemberExpression)
			.on(
				AsPrimaryExpression
			)
			.while()
				.if(
					new AsPunctuator(`[`),
					AsExpression,
					new AsPunctuator(`]`)
				)
				.else(
					new AsPunctuator(`.`),
					AsIdentifer
				);
				
	}

	static toData (data) {
		if (data.length === 1) {
			return data;
		}
		data = data.filter((token) => {
			return token.type !== 'Punctuator';
		});
		let head = null;
		while (data.length > 0) {
			const object = {
				type: 'MemberExpression',
				computed: false,
				object: head !== null ? head : data.shift(), // XXX
				property: data.shift()
			};
			object.computed = object.property.type !== 'Identifer'; // XXX
			head = object;
		}
		return head;
	}
}

class AsPrimaryExpression {
	static get is () {
		return As.is(AsPrimaryExpression)
			.any(
				AsThisExpression,
				AsPrimitive,
				AsIdentifer,
				AsLiteral
			)
			.else(
				new AsPunctuator(`(`),
				AsExpression,
				new AsPunctuator(`)`)
			);
	}

	static toData (data) {
		if (data.length === 1) {
			return data[0];
		} else {
			return data[1];
		}
	}
}

class AsThisExpression extends AsEndToken {
	constructor (subject = null) {
		super('Keyword', subject);
	}

	static get is () {
		return As.is(AsThisExpression)
			.on(new AsThisExpression(`this`));
	}

	static toData (data) {
		return {
			type: 'ThisExpression'
		};
	}
}

class AsPrimitive extends AsEndToken {
	constructor (subject = null) {
		super('Identifer', subject);
	}

	static get is () {
		return As.is(AsPrimitive)
			.on(new AsPrimitive(/string|byte|short|float|int/));
	}

	static toData (data) {
		return {
			type: 'Primitive',
			name: data[0].value
		};
	}
}

class AsIdentifer extends AsEndToken {
	constructor (subject = null) {
		super('Identifer', subject);
	}

	static get is () {
		return As.is(AsIdentifer)
			.on(new AsIdentifer());
	}

	static toData (data) {
		return {
			type: 'Identifer',
			name: data[0].value
		};
	}
}

class AsLiteral {
	static get is () {
		return As.is(AsLiteral)
			.any(
				AsString,
				AsHexByte,
				AsHexShort,
				AsHexInt,
				AsDecimel,
				AsNumber
			);
	}

	static toData (data) {
		return data;
		// return {
		// 	type: 'Literal',
		// 	value: data[0].value,
		// 	raw: data[0].raw
		// };
	}
}

class AsString extends AsEndToken {
	constructor (subject = null) {
		super('String', subject);
	}

	static get is () {
		return As.is(AsString)
			.on(new AsString());
	}

	static toData (data) {
		return {
			type: 'String',
			value: data[0].value,
			raw: data[0].raw
		};
	}
}

// class AsBoolean extends AsEndToken {
// 	constructor (subject = null) {
// 		super('Boolean', subject);
// 	}

// 	static get is () {
// 		return As.is(AsBoolean)
// 			.on(new AsBoolean());
// 	}

// 	static toData (data) {
// 		return {
// 			type: 'Boolean',
// 			value: data[0].value,
// 			raw: data[0].raw
// 		};
// 	}
// }

class AsHexByte extends AsEndToken {
	constructor (subject = null) {
		super('Numeric', subject);
	}

	static get is () {
		return As.is(AsHexByte)
			.on(new AsHexByte(/0x[0-9a-fA-F]{2}/));
	}

	static toData (data) {
		return {
			type: 'HexByte',
			value: data[0].value,
			raw: data[0].raw
		};
	}
}

class AsHexShort extends AsEndToken {
	constructor (subject = null) {
		super('Numeric', subject);
	}

	static get is () {
		return As.is(AsHexShort)
			.on(new AsHexShort(/0x[0-9a-fA-F]{4}/));
	}

	static toData (data) {
		return {
			type: 'HexShort',
			value: data[0].value,
			raw: data[0].raw
		};
	}
}

class AsHexInt extends AsEndToken {
	constructor (subject = null) {
		super('Numeric', subject);
	}

	static get is () {
		return As.is(AsHexInt)
			.on(new AsHexInt(/0x[0-9a-fA-F]{8}/));
	}

	static toData (data) {
		return {
			type: 'HexInt',
			value: data[0].value,
			raw: data[0].raw
		};
	}
}

class AsDecimel extends AsEndToken {
	constructor (subject = null) {
		super('Numeric', subject);
	}

	static get is () {
		return As.is(AsDecimel)
			.on(new AsDecimel(/^[0-9]+[.][0-9]+$/));
	}

	static toData (data) {
		return {
			type: 'Float',
			value: data[0].value,
			raw: data[0].raw
		};
	}
}

class AsNumber extends AsEndToken {
	constructor (subject = null) {
		super('Numeric', subject);
	}

	static get is () {
		return As.is(AsNumber)
			.on(new AsNumber(/^[0-9]+$/));
	}

	static toData (data) {
		return {
			type: 'Number',
			value: data[0].value,
			raw: data[0].raw
		};
	}
}

class AsOperator extends AsEndToken {
	constructor (subject = null) {
		super('Punctuator', subject);
	}
}

class AsPunctuator extends AsEndToken {
	constructor (subject = null) {
		super('Punctuator', subject);
	}
}
