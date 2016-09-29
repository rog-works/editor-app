'use strict'

class Path {
	static join (...args) {
		const routes = [];
		for (const route of args) {
			routes.push(...route.split('/'));
		}
		const results = [];
		for (const route of routes) {
			if (route === '..') {
				results.pop();
			} else {
				results.push(route);
			}
		}
		return results.join('/').replace('//', '/');// XXX
	}
	
	static dirname (path) {
		return Path.join(path, '..');
	}
	
	static basename (path) {
		return path.split('/').pop();
	}
}

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
		if (this._parent !== null) {
			return Path.join(this._parent.path, this._path);
		} else {
			return this._path;
		}
	}

	get size () {
		let num = 0;
		for (const child of this) {
			num += child.size();
		}
		return num;
	}

	at (rel) {
		const routes = rel.split('/');
		const name = routes.shift();
		for (const child of this) {
			// XXX
			if (name === '..') {
				return this._parent;
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
			node._parent.removeAt(node);
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

class EBNFTree extends _Node {
	constructor () {
		super();
		this._cwd = this;
	}

	on (...args) {
		for (const arg of args) {
			this._cwd.add(new EBNFStatement('on', arg));
		}
		return this;
	}

	if (...args) {
		this._md('if');
		this._cd('if');
		this.on(...args);
		return this;
	}

	else (...args) {
		this._cd('../');
		this._md('else');
		this._cd('else');
		this.on(...args);
		return this;
	}

	any (...args) {
		const first = args.pop();
		if (first !== null) {
			this.if(first);
		}
		for (const arg of args) {
			this.else(arg);
		}
		return this;
	}

	exists (...args) {
		this.if(...args);
		this.then();
		return this;
	}

	then (...args) {
		this._cd('../');
		this.on(...args);
		return this;
	}

	while (...args) {
		this._cd('../');
		this._md('while');
		this._cd('while');
		this.on(...args);
		return this;
	}

	without (...args) {
		this._md('without');
		this._cd('without');
		this.on(...args);
		return this;
	}

	_cd (rel) {
		const to = this._cwd.at(rel);
		if (to === null) {
			throw new Error(`No such entry. cwd = ${this._cwd.path}, rel = ${rel}`);
		}
		this._cwd = to;
	}

	_md (type) {
		this._cwd.add(new EBNFStatement(type));
	}
}
