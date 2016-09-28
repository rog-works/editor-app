'use strict'

class Path {
	static join (...args) {
		const routes = [];
		for (const route of args) {
			routes.push(...route.split('/'));
		}
		for (const route of routes) {
			if (route === '..') {
				routes.pop();
			} else {
				routes.push(route);
			}
		}
		return routes.join('/');
	}
	
	static dirname (path) {
		return Path.join(path, '..');
	}
	
	static basename (path) {
		return path.split('/')[-1];
	}
}

class Node extends Array {
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
		const num = 0;
		for (const child of this) {
			num += child.size();
		}
		return num;
	}

	at (rel) {
		const routes = rel.split('/');
		const name = routes.unshift(0);
		for (const child of this) {
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

class EBNFStatement extends Node {
	constructor (type = '/', dependecy) {
		super(type);
		this._dependecy = dependecy;
	}

	get type () {
		return this.name;
	}

	get dependecy () {
		return this._dependecy;
	}
}

class EBNFTree extends Node {
	constructor () {
		super();
		this._cwd = this;
	}

	on (...args) {
		for (const arg of args) {
			this._cwd.add(new EBNFStatement('on', arg));
		}
	}

	if (...args) {
		this._md('if');
		this._cd('if');
		this.on(...args);
	}

	else (...args) {
		this._cd('../');
		this._md('else');
		this._cd('else');
		this.on(...args);
	}

	any (...args) {
		const first = args.pop();
		if (first !== null) {
			this.if(first);
		}
		for (const arg of args) {
			this.else(arg);
		}
	}

	exists (...args) {
		this.if(...args);
		this.then();
	}

	then (...args) {
		this._cd('../');
		this.on(...args);
	}

	while (...args) {
		this._cd('../');
		this._md('while');
		this._cd('while');
		this.on(...args);
	}

	_cd (rel) {
		const to = this._cwd.at(rel);
		if (to !== null) {
			throw new Error(`No such entry. cwd = ${this._cwd.path}, rel = ${rel}`);
		}
		this._cwd = to;
	}

	_md (type) {
		this._cwd.add(new EBNFStatement(type));
	}
}
