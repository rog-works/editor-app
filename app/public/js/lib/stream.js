'use strict';

class Stream {
	constructor (source = '') {
		this._source = source;
	}

	get length () {
		return this._source.length;
	}

	get source () {
		return this._source;
	}

	load (source) {
		this._source = source;
	}

	isInside (index) {
		return index >= 0 && index < this.length;
	}

	read (before, length = undefined) {
		if (this.isInside(before)) {
			return this._source.substr(before, length);
		} else {
			return '';
		}
	}

	write (values, before) {
		const _before = Math.min(Math.max(before, 0), this.length);
		if (_before === 0) {
			this._source = values + this.read(values.length + _before);
		} else if (_before === this.length) {
			this._source = this._source + values;
		} else {
			const head = this.read(0, _before);
			const tail = this.read(_before + values.length);
			this._source = head + values + tail;
		}
	}

	insert (values, before) {
		const _before = Math.min(Math.max(before, 0), this.length);
		if (_before === 0) {
			this._source = values + this._source;
		} else if (_before === this.length) {
			this._source = this._source + values;
		} else {
			const head = this.read(0, _before);
			const tail = this.read(_before);
			this._source = head + values + tail;
		}
	}

	remove (before, length) {
		if (this.isInside(before)) {
			const head = this.read(0, before);
			const tail = this.read(before + length);
			this._source = head + tail;
		}
	}
}
