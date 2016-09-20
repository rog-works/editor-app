'use strict';

class Undo extends Array {
	constructor (limit = 100) {
		super();
		this._head = 0;
		this._curr = 0;
		this._peak = 0;
		for (let i = 0; i < limit; i += 1) {
			this.push(null);
		}
	}

	get canUndo () {
		return this._curr < this._peak;
	}

	get canRedo () {
		return this._curr > 0;
	}

	add (tag, before, after) {
		const buffer = new UndoBuffer(tag, before, after);
		this[this._head] = buffer;
		this._head = (this._head + 1) % this.length;
		this._peak = this._curr > 0 ? this._curr : Math.min(this._peak + 1, this.length);
		this._curr = 0;
		return buffer;
	}

	clear () {
		this._curr = 0;
		this._peak = 0;
	}

	undo () {
		if (this.canUndo) {
			this._at(++this._curr).restore();
		}
	}

	redo () {
		if (this.canRedo) {
			this._at(this._curr--).apply();
		}
	}

	_at (index) {
		return this[(this._head + this.length - index) % this.length];
	}
}

class UndoBuffer {
	constructor (tag, before = null, after = null) {
		 this.tag = tag;
		 this.before = before;
		 this.after = after;
		 this.restore = null;
		 this.apply = null;
	}

	undo (restore) {
		this.restore = () => {
			restore(this.tag, this.before, this.after);
		};
		return this;
	}

	redo (apply) {
		this.apply = () => {
			apply(this.tag, this.before, this.after);
		};
		return this;
	}
}
