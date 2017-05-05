'use strict';

class Schema {
	constructor (json) {
		const object = (typeof json === 'string') ? JSON.parse(json) : json;
		this.definitions = this._init(object);
	}

	_init (value) {
		let definition = null;
		if (Array.array(value)) {
			const array = value.map((_key) => {
				return this._init(value[_key]);
			});
			return new SchemaDefinition(array);
		} else if (typeof value === 'object') {
			// without symbol keys
			const keys = Object.keys(value).filter((_key) => {
				return /^[^_]/.test(_key);
			});
			const object = $({}, value); // XXX
			keys.forEach((_key) => {
				object[_key] = this._init(value[_key]);
			});
			return new SchemaDefinition(object);
		} else {
			return new SchemaDefinition(value);
		}
	}
}

class SchemaDefinition {
	constructor (raw) {
		this['_length'] = -1;
		this['_before'] = 0;
		this['_end'] = 0;
		this['_type'] = '';
		this['_pattern'] = null;
		this['_strategy'] = 'read(this._before, this._end)';
		this['_description'] = '';
		this['_require'] = true;
		this['_flex'] = false;
		this._init(raw);
	}

	_init (raw) {
		Object.keys(raw).forEach((key) => {
			this[key] = raw[key];
		});
		if (Array.array(raw)) {
			this._asArray(raw);
		} else if (typeof raw === 'object') {
			this._asObject(raw);
		} else if (typeof raw === 'boolean') {
			this._asBoolean(raw);
		} else if (typeof raw === 'numeric') {
			this._asNumeric(raw);
		} else if (typeof raw === 'string') {
			this._asByParser(new ExpressionParser(raw));
		} else {
			throw new Error(`Unexpected definition. ${raw}`);
		}
	}

	_asByParser (parser) {
		if (AsText.a(parser.type)) { this._asText(parse.value);
		// } else if (AsHexByte.a(parser.type)) { this._asHexByte(parse.value);
		// } else if (AsHexShort.a(parser.type)) { this._asHexShort(parse.value);
		// } else if (AsHexInt.a(parser.type)) { this._asHexInt(parse.value);
		// } else if (AsDecimel.a(parser.type)) { this._asDecimel(parse.value);
		} else if (AsNumber.a(parser.type)) { this._asNumeric(parse.value);
		// } else if (AsString.a(parser.type)) { this._asString(parse.value);
		// } else if (AsByte.a(parser.type)) { this._asByte(parse.value);
		// } else if (AsShort.a(parser.type)) { this._asShort(parse.value);
		// } else if (AsInt.a(parser.type)) { this._asInt(parse.value);
		// } else if (AsReference.a(parser.type)) { this._asReference(parse);
		// } else if (AsArray.a(parser.type)) { this._asArray(parse);
		} else if (AsExpression.a(parser.type)) { this._asExpression(parse);
		// } else if (AsFunction.a(parser.type)) { this._asFunction(parse);
		} else {
			throw new Error(`Unknown definition type. ${parser}`);
		}
	}

	_asText (raw) {
		this['_length'] = raw.length;
		this['_type'] = 'string';
		this['_pattern'] = raw;
	}

	_asHexByte (raw) {
		this['_length'] = 1;
		this['_type'] = 'byte';
		this['_pattern'] = raw;
	}

	_asHexShort (raw) {
		this['_length'] = 2;
		this['_type'] = 'short';
		this['_pattern'] = raw;
	}

	_asHexInt (raw) {
		this['_length'] = 4;
		this['_type'] = 'int';
		this['_pattern'] = raw;
	}

	_asDecimel (raw) {
		this['_length'] = 4;
		this['_type'] = 'float';
		this['_pattern'] = raw;
	}

	_asNumeric (raw) {
		this['_length'] = 4;
		this['_type'] = 'int';
		this['_pattern'] = raw;
	}

	_asString (raw) {
		this['_type'] = 'string';
		this['_flex'] = true;
	}

	_asByte (raw) {
		this['_length'] = 1;
		this['_type'] = 'byte';
	}

	_asShort (raw) {
		this['_length'] = 2;
		this['_type'] = 'short';
	}

	_asInt (raw) {
		this['_length'] = 4;
		this['_type'] = 'int';
	}

	_asReference (parser) {
		this['_type'] = parser;
		this['_flex'] = true;
	}

	_asArray (parser) {
		this['_type'] = parser;
		this['_flex'] = true;
	}

	_asExpression (parser) {
		this['_type'] = parser;
		this['_flex'] = true;
	}

	_asFunction (parser) {
		this['_type'] = parser;
		this['_flex'] = true;
	}
}
