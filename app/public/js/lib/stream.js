'use strict';

class Stream {
	constructor (source) {
		this._source = source;
		this._pos = 0;
		this.load(this._source);
	}

	get pos () {
		return this._pos;
	}

	get length () {
		return this._source.length;
	}

	get source () {
		return this._source;
	}

	// XXX
	set source (value) {
		this._source = value;
	}

	get available () {
		return this.length - this._pos;
	}

	seek (value, type = 'curr') {
		let next = this.pos;
		switch (type) {
			case 'curr':
				next += value;
				break;
			case 'begin':
				next = value;
				break;
			case 'end':
				next = this.length - value;
				break;
		}
		this._pos = this._roundPos(next);
	}

	_roundPos (pos) {
		return Math.min(Math.max(pos, 0), this.length);
	}

	_roundAvailable (length) {
		return Math.min(length, this.available);
	}

	load (source) {
		this._source = source;
		this._pos = 0;
	}

	isInside (offset = undefined) {
		const end = this._roundPos(this.pos + (offset || 0));
		return this.pos <= end && end <= this.length;
	}

	read (length = undefined) {
		const _length = this._roundAvailable(length !== undefined ? length : this.available);
		if (this.isInside(_length)) {
			const begin = this.pos;
			const data = this._readImpl(_length);
			this.seek(begin + _length, 'begin');
			return data;
		} else {
			// FIXME
			return '';
		}
	}

	// expected override the sub class
	_readImpl (length) {
		throw new Error('No implemented');
	}

	peak (length = undefined) {
		const _length = this._roundAvailable(length !== undefined ? length : this.available);
		const begin = this.pos;
		const data = this.read(_length);
		this.seek(begin, 'begin');
		return data;
	}

	write (values) {
		const begin = this.pos;
		if (this.pos === 0) {
			this.remove(values.length);
			this.seek(0, 'begin');
			this.insert(values);
		} else if (this.pos === this.length) {
			this.insert(values);
		} else {
			this._writeImpl(values);
		}
		this.seek(begin + values.length, 'begin');
	}

	// expected override the sub class
	_writeImpl (pos, values) {
		throw new Error('No implemented');
	}

	insert (values) {
		const begin = this.pos;
		this._insertImpl(values);
		this.seek(begin + values.length, 'begin');
	}

	_insertImpl (values) {
		throw new Error('No implemented');
	}

	remove (length = undefined) {
		const _length = this._roundAvailable(length !== undefined ? length : this.available);
		if (_length > 0) {
			const begin = this.pos;
			this._removeImpl(_length);
			this.seek(begin, 'begin');
		}
	}

	_removeImpl (values) {
		throw new Error('No implemented');
	}
}

class TextStream extends Stream {
	constructor (source = '') {
		super(source);
	}

	// @override
	_readImpl (length) {
		return this.source.substr(this.pos, length);
	}

	// @override
	_writeImpl (values) {
		const begin = this.pos;
		this.seek(0, 'begin');
		const head = this.read(begin);
		this.seek(values.length);
		const tail = this.read();
		this.source = head + values + tail;
	}

	// @override
	_insertImpl (values) {
		if (this.pos === 0) {
			this.source = values + this.source;
		} else if (this.pos === this.length) {
			this.source = this.source + values;
		} else {
			const begin = this.pos;
			this.seek(0, 'begin');
			const head = this.read(begin);
			const tail = this.read();
			this.source = head + values + tail;
		}
	}

	// @override
	_removeImpl (length) {
		const begin = this.pos;
		this.seek(0, 'begin');
		const head = this.read(begin);
		this.seek(length);
		const tail = this.read();
		this.source = head + tail;
	}
}

class ArrayStream extends Stream {
	constructor (source = []) {
		super(source);
	}

	// @override
	_readImpl (length) {
		// XXX copyWithin
		const copy = [];
		for (let i = 0; i < length; i += 1) {
			copy.push(this.source[this.pos + i]);
		}
		return copy;
	}

	// @override
	_writeImpl (values) {
		this.source.splice(this.pos, values.length, ...values);
	}

	// @override
	_insertImpl (values) {
		if (this.pos === 0) {
			this.source.unshift(...values);
		} else if (this.pos === this.length) {
			this.source.push(...values);
		} else {
			this.source.splice(this.pos, 0, ...values);
		}
	}

	// @override
	_removeImpl (length) {
		this.source.splice(this.pos, length);
	}
}
