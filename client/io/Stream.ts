export enum SeekTypes {
	Curr,
	Begin,
	End
}

type Buffer = string | BufferSource; // FIXME type mismatch?

export abstract class Stream {
	public constructor(
		private _source: Buffer,
		private _pos: number = 0
	) {
		this.load(this._source);
	}

	public get pos(): number {
		return this._pos;
	}

	public get length(): number {
		return this._source.length;
	}

	public get source(): Buffer {
		return this._source;
	}

	// XXX
	public set source(value: Buffer) {
		this._source = value;
	}

	public get available(): number {
		return this.length - this._pos;
	}

	public seek(value: number, type: SeekTypes = SeekTypes.Curr): void {
		let next = this.pos;
		switch (type) {
		case SeekTypes.Curr:
			next += value;
			break;
		case SeekTypes.Begin:
			next = value;
			break;
		case SeekTypes.End:
			next = this.length - value;
			break;
		}
		this._pos = this._roundPos(next);
	}

	private _roundPos(pos: number): number {
		return Math.min(Math.max(pos, 0), this.length);
	}

	private _roundAvailable(length: number): number {
		return Math.min(length, this.available);
	}

	public load(source: Buffer): void {
		this._source = source;
		this._pos = 0;
	}

	public isInside(offset: number | undefined = undefined): boolean { // XXX undefined?!
		const end = this._roundPos(this.pos + (offset || 0));
		return this.pos <= end && end <= this.length;
	}

	public read(length: number | undefined = undefined): string { // FIXME number | string ?
		const _length = this._roundAvailable(length !== undefined ? length : this.available);
		if (this.isInside(_length)) {
			const begin = this.pos;
			const data = this._readImpl(_length);
			this.seek(begin + _length, SeekTypes.Begin);
			return data;
		} else {
			return ''; // XXX
		}
	}

	protected abstract _readImpl(length: number): number;

	public peak(length: number | undefined = undefined): number { // XXX number | string ?
		const _length = this._roundAvailable(length !== undefined ? length : this.available);
		const begin = this.pos;
		const data = this.read(_length);
		this.seek(begin, SeekTypes.Begin);
		return data;
	}

	public write(values: number[]): void { // XXX mismatch?
		const begin = this.pos;
		if (this.pos === 0) {
			this.remove(values.length);
			this.seek(0, SeekTypes.Begin);
			this.insert(values);
		} else if (this.pos === this.length) {
			this.insert(values);
		} else {
			this._writeImpl(values);
		}
		this.seek(begin + values.length, SeekTypes.Begin);
	}

	protected abstract _writeImpl(pos: number, values: number[]): void; // XXX mismatch

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
