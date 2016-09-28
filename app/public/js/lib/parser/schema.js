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
				return /^[^:]/.test(_key);
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
		this[':length'] = -1;
		this[':before'] = 0;
		this[':end'] = 0;
		this[':type'] = '';
		this[':pattern'] = null;
		this[':strategy'] = 'read(this.:before, this.:end)';
		this[':description'] = '';
		this[':require'] = true;
		this[':flex'] = false;
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
		this[':length'] = raw.length;
		this[':type'] = 'string';
		this[':pattern'] = raw;
	}

	_asHexByte (raw) {
		this[':length'] = 1;
		this[':type'] = 'byte';
		this[':pattern'] = raw;
	}

	_asHexShort (raw) {
		this[':length'] = 2;
		this[':type'] = 'short';
		this[':pattern'] = raw;
	}

	_asHexInt (raw) {
		this[':length'] = 4;
		this[':type'] = 'int';
		this[':pattern'] = raw;
	}

	_asDecimel (raw) {
		this[':length'] = 4;
		this[':type'] = 'float';
		this[':pattern'] = raw;
	}

	_asNumeric (raw) {
		this[':length'] = 4;
		this[':type'] = 'float';
		this[':pattern'] = raw;
	}

	_asString (raw) {
		this[':type'] = 'string';
		this[':flex'] = true;
	}

	_asByte (raw) {
		this[':length'] = 1;
		this[':type'] = 'byte';
	}

	_asShort (raw) {
		this[':length'] = 2;
		this[':type'] = 'short';
	}

	_asInt (raw) {
		this[':length'] = 4;
		this[':type'] = 'int';
	}

	_asReference (parser) {
		this[':type'] = parser;
		this[':flex'] = true;
	}

	_asArray (parser) {
		this[':type'] = parser;
		this[':flex'] = true;
	}

	_asExpression (parser) {
		this[':type'] = parser;
		this[':flex'] = true;
	}

	_asFunction (parser) {
		this[':type'] = parser;
		this[':flex'] = true;
	}
}
