'use strict'

class _Node extends Array {
	constructor (path = '/') {
		super();
		this._parent = null;
		this._path = path;
	}

	get name () {
		return Path.basename(this.path);
	}

	get dir () {
		return Path.dirname(this.path);
	}

	get path () {
		if (this.parent !== null) {
			return Path.join(this.parent.path, this._path);
		} else {
			return this._path;
		}
	}

	get parent () {
		return this._parent;
	}

	get root () {
		let curr = this;
		while (curr.parent !== null) {
			curr = curr.parent;
		}
		return curr;
	}

	get size () {
		let num = 0;
		for (const child of this) {
			num += child.size;
		}
		return num;
	}

	at (rel) {
		const routes = rel.split('/');
		const name = routes.shift();
		for (const child of this) {
			// XXX
			if (name === '..') {
				return this.parent;
			}
			if (child.name !== name) {
				continue;
			}
			if (routes.length > 0) {
				return child.at(Path.join(...routes));
			} else {
				return child;
			}
		}
		return null;
	}

	add (child) {
		child._parent = this;
		this.push(child);
	}

	remove (rel) {
		const node = this.at(rel);
		if (node !== null) {
			node.parent.removeAt(node);
		}
	}

	removeAt (child) {
		const index = this.indexOf(child);
		if (index !== null) {
			return this.splice(index, 1);
		}
	}
}

class EBNFStatement extends _Node {
	constructor (type = '/', dependecy = null) {
		super(type);
		this._dependecy = dependecy;
		// XXX deprecated
		this._prev = null;
		this._next = null;
	}

	// XXX
	get from () {
		return null;
	}

	get type () {
		return this.name;
	}

	get dependecy () {
		return this._dependecy;
	}

	// XXX deprecated
	get hasNext () {
		return this._next !== null;
	}

	add (child) {
		// XXX deprecated
		if (this.length > 0) {
			const prev = this[this.length - 1];
			prev._next = child;
			child._prev = prev;
		}
		super.add(child);
	}
}

class EBNFDefinition extends EBNFStatement {
	constructor (from) {
		super();
		this._from = from;
		this._cwd = this;
	}

	get from () {
		return this._from;
	}

	on (...args) {
		for (const arg of args) {
			this._cwd.add(new EBNFStatement('on', arg));
		}
		return this;
	}

	if (...args) {
		this._md('if');
		this.on(...args);
		return this;
	}

	else (...args) {
		this._cd('../');
		this._md('else');
		this.on(...args);
		return this;
	}

	any (...args) {
		const first = args.shift();
		if (first !== null) {
			this.if(first);
		}
		for (const arg of args) {
			this.else(arg);
		}
		return this;
	}

	option (...args) {
		this._md('option');
		this.on(...args);
		return this;
	}

	then (...args) {
		this._cd('../');
		this.on(...args);
		return this;
	}

	while (...args) {
		this._md('while');
		this.on(...args);
		return this;
	}

	without (...args) {
		this._md('without');
		this.on(...args);
		return this;
	}

	_cd (rel) {
		const to = this._cwd.at(rel);
		if (to === null) {
			throw new Error(`No such entry. cwd = "${this._cwd.path}", rel = "${rel}"`);
		}
		this._cwd = to;
	}

	_md (type) {
		const statement = new EBNFStatement(type);
		this._cwd.add(statement);
		// XXX cwd on the peak statement
		this._cwd = statement;
	}
}
