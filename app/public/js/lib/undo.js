'use strict';

class Undo extends Array {
	constructor () {
		super();
		this.curr = 0;
	}

	get canUndo () {
		return this.curr > 0;
	}

	get canRedo () {
		return this.curr < this.length;
	}

	add (tag, before, after) {
		return new Promise((resolve, reject) => {
			const removes = this.length - this.curr - 1;
			for (let i = 0; i < removes; i += 1) {
				this.pop();
			}
			this.push(new UndoBuffer(tag, before, after, resolve, reject));
		});
	}

	clear () {
		while (this.length > 0) {
			this.pop();
		}
		this.curr = 0;
	}

	undo () {
		if (this.canUndo) {
			this._at(this.curr--).restore();
		}
	}

	redo () {
		if (this.canRedo) {
			this._at(this.curr++).apply();
		}
	}

	_at (index) {
		if (index < this.length) {
			return this[index];
		}
		return null;
	}
}

class UndoBuffer {
	constructor (tag, before, after, apply, restore) {
		this.apply = () => {
			apply(tag, before, after);
		};
		this.restore = () => {
			restore(tag, before, after);
		};
	}
}
