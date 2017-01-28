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

class DefinitionFactory {
	static create (key, value) {
		if (DefinitionFactory.isObject(value)) {
			return new ObjectDefinition(key, value);
		} else {
			return new ValueDefinition(key, value);
		}
	}
}

class Definition extends _Node {
	constructor (key, value) {
		super(key);
		this._length = null;
		this._begin = null;
		this._end = null;
		this._type = null;
		this._expected = null;
		this._strategy = 'read(this._begin, this._end)';
		this._description = '';
		this._require = true;
		this._flex = false;
		if (typeof value === 'object') {
			this._update(value);
		}
	}

	_update (data) {
		for (let key in data) {
			if (key in this) {
				this[key] = value[key];
			} else {
				throw new Error(`Unexpected definition key. ${key}`);
			}
		}
	}

	get context () {
		return {
			root: this.root,
			parent: this.parent,
			this: this
		};
	}

	calcPrev () {
		if (this.parent === null) {
			return null;
		}
		const index = this.parent.indexOf(this.name);
		return index === 0 ? this.parent : this.parent[index - 1];
	}

	calcBegin () {
		const prev = this.calcPrev();
		return prev === null ? 0 : prev.begin + prev._length;
	}

	static isObject (value) {
		if (typeof value === 'object') {
			return Object.keys(value).filter(key => /^[^_]/.test(key)).length > 0;
		} else {
			return false;
		}
	}
}

class ObjectDefinition extends Definition {
	constructor (key, value) {
		super(key, value);
		this._init(value);
	}

	_init (data) {
		for (let key in data) {
			const value = data[key];
			if (Definition.isObject(value)) {
				this.add(new ObjectDefinition(key, value));
			} else {
				this.add(new ValueDefinition(key, value));
			}
		}
	}

	deserialize (stream) {
		const data = {};
		for(const child of this) {
			data[child.name] = child.deserialize(stream);
		}
		return data;
	}
}

class IntDefinition extends Definition {
	deserialize (stream) {
		stream.seek('begin', this._begin);
		return stream.readInt();
	}
}

class StringDefinition extends Definition {
	deserialize (stream) {
		stream.seek('begin', this._begin);
		return HexUtil.byteToStrUTF8(stream.read(this._length));
	}
}

class ArrayDefinition extends Definition {
	deserialize (stream) {
		stream.seek('begin', this._begin);
		return stream.read(this._length);
	}
}

class ValueDefinition extends Definition {
	constructor (key, value) {
		super(key, value);
		this._init(value);
	}
	
	_init (value) {
		if (typeof value === 'object') {
			// FIXME
			this._expression = null;
		} else if (typeof value === 'string') {
			const expression = new Expression(value);
			if (expression instanceof CallExpression) {
				expression.callee
			}
		} else {
			throw new Error(`Unexpected value type. '${typeof value}'`);
		}
	}

	_exec (context, expression) {
		return Script.create()
			.bind({
				context: context,
				stream: stream
			})
			.run(expression);
	}

	calcActual (stream) {
		stream.seek('begin', this.begin)
		return stream.read(this.length);
	}

	deserialize (stream) {
		return this.calcActual(stream);
	}
}
