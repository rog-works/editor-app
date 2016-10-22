'use strict';

class Reader {
	constructor (schema) {
		this._schema = schema;
		this._definitions = {};
	}

	_pluck (path) {
		const routes = path.split('/');
		let curr = this._schema;
		for (const route of routes) {
			if (route in curr) {
				curr = curr[route];
			} else {
				return null;
			}
		}
		return curr;
	}

	_def (path) {
		if (!(path in this._definitions)) {
			this._definitions[path] = new Def(this._pluck(path));
		}
		return this._definitions[path];
	}

	read (stream) {
		this._def(path).read(stream);
	}
}

class Schema {
	constructor (defenition) {
		this._definition = defenition;
	}

	static create (json) {
		return new Schema(DefinitionFactory.create('/', JSON.parse(json)));
	}

	deserialize (stream) {
		return this._definition.deserialize(stream);
	}

	tree () {
		return [];
	}
}

class DefinitionFactory {
	static create (key, value) {
		if (DefinitionFactory.isObject(value)) {
			return new ObjectDefinition(key, value);
		} else {
			return new ValueDefinition(key, value);
		}
	}

	static isObject (value) {
		if (typeof value === 'object') {
			return Object.keys(value).filter((key) => { return /^[^_]/.test(key); }).length > 0;
		} else {
			return false;
		}
	}
}

class Definition extends _Node {
	constructor (key, value) {
		super(key);
		this._length = -1;
		this._before = 0;
		this._end = 0;
		this._type = '';
		this._pattern = null;
		this._strategy = 'read(this._before, this._end)';
		this._description = '';
		this._require = true;
		this._flex = false;
		if (typeof value === 'object') {
			this._override(value);
		}
	}

	_override (data) {
		for (let key in data) {
			if (key in this) {
				this[key] = value[key];
			} else {
				throw new Error(`Unexpected definition key ${key}`);
			}
		}
	}
}

class ObjectDefinition extends Definition {
	constructor (key, value) {
		super(key, value);
		Object.keys(value).filter()
	}

	deserialize (stream) {
		for(const child of this) {
			child.value();
		}
	}
}
