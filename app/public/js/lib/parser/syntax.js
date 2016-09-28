'use strict';

// const parser = new BinaryParser(new Schema(json));
// parser.deserialize();

class AsExpresstion {
	static a (key = null) {
		return key === null ? 'expression' : key === 'expression';
	}

	static is () {
		return As.is()
			.on(AsLogicalCompareExpression)
	}
}

class AsLogicalCompareExpression {
	static a (key = null) {
		return key === null ? 'logical-compare-expression' : key === 'logical-compare-expression';
	}

	static is () {
		return As.is()
			.if(AsBitCalcExpression)
			.else(
				AsLogicalCompareExpression,
				new AsEndSymbol(/[&]{2}|[|]{2}/),
				AsBitCalcExpression
			);
	}
}

class AsBitCalcExpression {
	static a (key = null) {
		return key === null ? 'bit-calc-expression' : key === 'bit-calc-expression';
	}

	static is () {
		return As.is()
			.if(AsEqualsCompareExpression)
			.else(
				AsBitCalcExpression,
				new AsEndSymbol(/[&^|]/),
				AsEqualsCompareExpression
			);
	}
}

class AsEqualsCompareExpression {
	static a (key = null) {
		return key === null ? 'equals-compare-expression' : key === 'equals-compare-expression';
	}

	static is () {
		return As.is()
			.if(AsSizeCompareExpression)
			.else(
				AsEqualsCompareExpression,
				new AsEndSymbol(/==|!=/),
				AsSizeCompareExpression
			);
	}
}

class AsSizeCompareExpression {
	static a (key = null) {
		return key === null ? 'size-calc-expression' : key === 'size-calc-expression';
	}

	static is () {
		return As.is()
			.if(AsAddSubCalcExpression)
			.else(
				AsSizeCompareExpression,
				new AsEndSymbol(/<|<=|>|>=/),
				AsAddSubCalcExpression
			);
	}
}

class AsAddSubCalcExpression {
	static a (key = null) {
		return key === null ? 'addsub-calc-expression' : key === 'addsub-calc-expression';
	}

	static is () {
		return As.is()
			.if(AsMulDivCalcExpression)
			.else(
				AsAddSubCalcExpression,
				new AsEndSymbol(/[*/%]/),
				AsMulDivCalcExpression
			);
	}
}

class AsMulDivCalcExpression {
	static a (key = null) {
		return key === null ? 'muldiv-calc-expression' : key === 'muldiv-calc-expression';
	}

	static is () {
		return As.is()
			.if(AsOperand)
			.else(
				AsMulDivCalcExpression,
				new AsEndSymbol(/[*/%]/),
				AsOperand
			);
	}
}

class AsOperand {
	static a (key = null) {
		return key === null ? 'operand' : key === 'operand';
	}

	static is () {
		return As.is()
			.any(
				AsConstant,
				AsVariable,
				// AsFunction
			)
			.else(
				new AsEndSymbol('('),
				AsExpression,
				new AsEndSymbol(')')
			);
	}
}

class AsVariable {
	static a (key = null) {
		return key === null ? 'variable' : key === 'variable';
	}

	static is () {
		return As.is()
			.on(AsIdentifer)
			.while(
				new AsEndSymbol('.'),
				AsIdentifer
			)
	}
}

class AsIdentifer {
	static a (key = null) {
		return key === null ? 'identifer' : key === 'identifer';
	}

	static is () {
		return As.is()
			.on(new AsEndSymbol(/[a-zA-Z$_][0-9a-zA-Z$_:]*/))
	}
}

class AsConstant {
	static a (key = null) {
		return key === null ? 'constant' : key === 'constant';
	}

	static is () {
		return As.is()
			.any(
				AsText,
				// AsHexByte,
				// AsHexShort,
				// AsHexInt,
				// AsDecimel,
				AsNumber
			);
	}
}

class AsText {
	static a (key = null) {
		return key === null ? 'text' : key === 'text';
	}

	static is () {
		return As.is()
			.on(
				new AsEndSymbol("'"),
				new AsText(),
				new AsEndSymbol("'")
			)
	}

	parse (reader) {
		const value = reader.next();
		return {
			type: 'text',
			value: value,
			raw: `'${value}'`
		};
	}
}

class AsNumber {
	static a (key = null) {
		return key === null ? 'number' : key === 'number';
	}

	static is () {
		return As.is()
			.on(new AsNumber());
	}

	parse (reader) {
		const value = reader.next();
		return {
			type: 'number',
			value: parseInt(value),
			raw: value
		};
	}
}
