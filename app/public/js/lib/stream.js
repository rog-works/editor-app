'use strict';

class Stream {
	constructor (source = '') {
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
		this._pos = Math.min(Math.max(next, 0), this.length);
	}

	_toAbsolute (offset = undefined) {
		return Math.max(this._pos + (offset || 0), 0);
	}

	load (source) {
		this._source = source;
		this._pos = 0;
	}

	isInside (offset = undefined) {
		const end = this._toAbsolute(offset);
		return this.pos < end && end < this.length;
	}

	read (length = undefined) {
		const _length = length || this.available;
		if (this.isInside(_length)) {
			const str = this._source.substr(this.pos, _length);
			this.seek(_length);
			return str;
		} else {
			return '';
		}
	}

	peak (length = undefined) {
		const _length = length || this.available;
		const begin = this.pos;
		const str = this.read(_length);
		this.seek(begin, 'begin');
		return str;
	}

	write (values) {
		if (this.pos === 0) {
			this.seek(values.length);
			this._source = values + this.peak();
		} else if (this.pos === this.length) {
			this._source = this._source + values;
		} else {
			const begin = this.pos;
			this.seek(0, 'begin');
			const head = this.read(begin);
			this.seek(values.length);
			const tail = this.read();
			this._source = head + values + tail;
			this.seek(head.length + values.length, 'begin');
		}
	}

	insert (values) {
		if (this.pos === 0) {
			this._source = values + this._source;
		} else if (index === this.length) {
			this._source = this._source + values;
		} else {
			const begin = this.pos;
			this.seek(0, 'begin');
			const head = this.read(begin);
			const tail = this.read();
			this._source = head + values + tail;
			this.seek(head.length + values.length, 'begin');
		}
	}

	remove (length = undefined) {
		const _length = length || this.available;
		if (this.isInside(_length)) {
			const begin = this.pos;
			this.seek(0, 'begin');
			const head = this.read(begin);
			this.seek(length);
			const tail = this.read();
			this._source = head + tail;
			this.seek(begin, 'begin');
		}
	}
}
