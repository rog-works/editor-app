'use strict';

class HexEditor {
	constructor () {
		// keypress
		this.KEY_CODE_0 = 48;
		this.KEY_CODE_1 = 49;
		this.KEY_CODE_2 = 50;
		this.KEY_CODE_3 = 51;
		this.KEY_CODE_4 = 52;
		this.KEY_CODE_5 = 53;
		this.KEY_CODE_6 = 54;
		this.KEY_CODE_7 = 55;
		this.KEY_CODE_8 = 56;
		this.KEY_CODE_9 = 57;
		this.KEY_CODE_A = 65;
		this.KEY_CODE_B = 66;
		this.KEY_CODE_C = 67;
		this.KEY_CODE_D = 68;
		this.KEY_CODE_E = 69;
		this.KEY_CODE_F = 70;
		// keyup/down
		// - move cursor
		this.KEY_CODE_LEFT = 37;
		this.KEY_CODE_UP = 38;
		this.KEY_CODE_RIGHT = 39;
		this.KEY_CODE_DOWN = 40;
		// - copy/cut/paste
		this.KEY_CODE_COPY = 67;
		this.KEY_CODE_CUT = 88;
		this.KEY_CODE_PASTE = 86;
		// - remove
		this.KEY_CODE_REMOVE = 46;
		this.KEY_CODE_BACKSPACE = 8;
		// - toggle update/insert
		this.KEY_CODE_INSERT = 45;
		// - undo/redo
		this.KEY_CODE_UNDO = 90;
		this.KEY_CODE_REDO = 89;
		// - save
		this.KEY_CODE_SAVE = 83;

		this._stream = null;
		this._mode = 'update';
		this.cursor = ko.observable(0);
		this._selectBegin = -1;
		this._selectEnd = -1;
		this._undo = new Undo();
	}

	get selectBegin () {
		return this._selectBegin;
	}

	get selectEnd () {
		return this._selectEnd;
	}

	load (stream) {
		this._stream = stream;
		this._mode = 'update';
		this.cursor(0);
		this._undo.clear();
		this.unselect();
	}

	unselect () {
		this._selectBegin = -1;
		this._selectEnd = -1;
	}

	onCopy (clipboard) {
		if (this.isSelected()) {
			this._toClipboard(clipboard, this._selectedValues());
			return false;
		} else {
			return true;
		}
	}

	onCut (clipboard) {
		if (this.isSelected()) {
			this._toClipboard(clipboard, this._selectedValues());
			this.bulkRemove(this._selectBegin, this._selectEnd - this._selectBegin);
			this.unselect();
			return false;
		} else {
			return true;
		}
	}

	onPaste (clipboard) {
		if (this.isSelected()) {
			this.bulkRemove(this._selectBegin, this._selectEnd - this._selectBegin);
			this.unselect();
		}
		this.bulkInsert(this.cursor(), this._fromClipboard(clipboard));
		return false;
	}

	onKeydown (keyCode, isCtrl, isShift) {
		 if (isShift) {
			switch (keyCode) {
				case this.KEY_CODE_LEFT:
				case this.KEY_CODE_UP:
				case this.KEY_CODE_RIGHT:
				case this.KEY_CODE_DOWN:
					return this._onKeydownSelectMove(keyCode);
				case this.KEY_CODE_F:
				case this.KEY_CODE_B:
					return isCtrl && this._onKeydownSelectMove(keyCode);
			}
		} else if (isCtrl) {
			switch (keyCode) {
				case this.KEY_CODE_F:
				case this.KEY_CODE_B:
					return this._onKeydownMove(keyCode);
				case this.KEY_CODE_UNDO:
					return this._onKeydownUndo();
				case this.KEY_CODE_REDO:
					return this._onKeydownRedo();
				case this.KEY_CODE_SAVE:
					return this._onKeydownSave();
			}
		} else if (!isCtrl && !isShift) {
			switch (keyCode) {
				case this.KEY_CODE_0:
				case this.KEY_CODE_1:
				case this.KEY_CODE_2:
				case this.KEY_CODE_3:
				case this.KEY_CODE_4:
				case this.KEY_CODE_5:
				case this.KEY_CODE_6:
				case this.KEY_CODE_7:
				case this.KEY_CODE_8:
				case this.KEY_CODE_9:
				case this.KEY_CODE_A:
				case this.KEY_CODE_B:
				case this.KEY_CODE_C:
				case this.KEY_CODE_D:
				case this.KEY_CODE_E:
				case this.KEY_CODE_F:
					return this._onKeypressUpdate(keyCode);
				case this.KEY_CODE_LEFT:
				case this.KEY_CODE_UP:
				case this.KEY_CODE_RIGHT:
				case this.KEY_CODE_DOWN:
					return this._onKeydownMove(keyCode);
				case this.KEY_CODE_REMOVE:
				case this.KEY_CODE_BACKSPACE:
					return this._onKeydownRemove(keyCode);
				case this.KEY_CODE_INSERT:
					return this._onKeydownInsert();
			}
		}
		return true;
	}

	_onKeypressUpdate (keyCode) {
		const allows = [
			this.KEY_CODE_0,
			this.KEY_CODE_1,
			this.KEY_CODE_2,
			this.KEY_CODE_3,
			this.KEY_CODE_4,
			this.KEY_CODE_5,
			this.KEY_CODE_6,
			this.KEY_CODE_7,
			this.KEY_CODE_8,
			this.KEY_CODE_9,
			this.KEY_CODE_A,
			this.KEY_CODE_B,
			this.KEY_CODE_C,
			this.KEY_CODE_D,
			this.KEY_CODE_E,
			this.KEY_CODE_F
		];
		const hex = allows.indexOf(keyCode).toString(16).toUpperCase();
		if (this.isInsert(this.cursor())) {
			this.insert(this.cursor(), hex);
		} else {
			this.update(this.cursor(), hex);
		}
		return false;
	}

	_onKeydownMove (keyCode) {
		const allows = {
			[this.KEY_CODE_LEFT]: -1,
			[this.KEY_CODE_UP]: -32,
			[this.KEY_CODE_RIGHT]: 1,
			[this.KEY_CODE_DOWN]: 32,
			// XXX
			[this.KEY_CODE_F]: 32 * 16,
			[this.KEY_CODE_B]: -32 * 16,
		};
		this.unselect();
		this.moveCursor(this.cursor() + allows[keyCode]);
		return false;
	}

	_onKeydownSelectMove (keyCode) {
		const allows = {
			[this.KEY_CODE_LEFT]: -1,
			[this.KEY_CODE_UP]: -32,
			[this.KEY_CODE_RIGHT]: 1,
			[this.KEY_CODE_DOWN]: 32,
			// XXX
			[this.KEY_CODE_F]: 32 * 16,
			[this.KEY_CODE_B]: -32 * 16,
		};
		const prev = this.cursor();
		const next = this._getNextCursor(this.cursor() + allows[keyCode]);
		const toBack = next < prev;
		const initialMoved = this._selectBegin === -1;
		// XXX
		if (initialMoved) {
			const begin = toBack ? next : prev;
			const end = toBack ? prev : next;
			this._selectBegin = Math.min(begin, this._stream.length);
			this._selectEnd = Math.max(end, 0);
		} else {
			if (this._selectBegin > next) {
				this._selectBegin = next;
			} else if (this._selectEnd < next) {
				this._selectEnd = next;
			} else if (toBack) {
				this._selectEnd = next;
			} else {
				this._selectBegin = next;
			}
		}
		this.moveCursor(next);
		return false;
	}

	_onKeydownRemove (keyCode) {
		if (this.isSelected()) {
			this.bulkRemove(this._selectBegin, this._selectEnd - this._selectBegin);
			this.unselect();
		} else {
			this.remove(this.cursor(), keyCode === this.KEY_CODE_BACKSPACE);
		}
		return false;
	}

	_onKeydownUndo () {
		if (this._undo.canUndo) {
			console.log('Undo');
			this._undo.undo();
		}
		return false;
	}

	_onKeydownRedo () {
		if (this._undo.canRedo) {
			console.log('Redo');
			this._undo.redo();
		}
		return false;
	}

	_onKeydownSave () {
		this.save();
		return false;
	}

	_onKeydownInsert () {
		this.toggleMode();
		return false;
	}

	_getNextCursor (cursor) {
		return Math.min(Math.max(cursor, 0), this._stream.length);
	}

	moveCursor (cursor) {
		this.cursor(this._getNextCursor(cursor));
	}

	update (cursor, hex) {
		const begin = ~~(cursor / 2) * 2;
		const even = (cursor % 2) === 0;
		this._stream.seek(begin, 'begin');
		const beforeValues = this._stream.peak(2);
		const high = even ? hex : beforeValues[0];
		const low = even ? '0' : hex;
		const afterValues = high + low;
		this._stream.write(afterValues);
		this.moveCursor(cursor + 1);
		// undo
		this._undo.add('update')
			.undo(() => {
				this._stream.seek(begin, 'begin');
				this._stream.write(beforeValues);
				this.moveCursor(cursor);
			})
			.redo(() => {
				this._stream.seek(begin, 'begin');
				this._stream.write(afterValues);
				this.moveCursor(cursor + 1);
			});
	}

	insert (cursor, hex) {
		this.bulkInsert(cursor, `${hex}0`);
		this.moveCursor(cursor + 1);
	}

	bulkInsert (cursor, hexValues) {
		this._stream.seek(cursor, 'begin');
		this._stream.insert(hexValues);
		this.moveCursor(cursor + hexValues.length);
		// undo
		this._undo.add('insert')
			.undo(() => {
				this._stream.seek(cursor, 'begin');
				this._stream.remove(hexValues.length);
				this.moveCursor(cursor);
			})
			.redo(() => {
				this._stream.seek(cursor, 'begin');
				this._stream.insert(hexValues);
				this.moveCursor(cursor + hexValues.length);
			});
	}

	remove (cursor, toBack = false) {
		const begin = toBack ? cursor - 2 : cursor;
		this.bulkRemove(begin, 2);
	}

	bulkRemove (cursor, length) {
		if (cursor < 0 || this._stream.length <= cursor) {
			console.warn('Unreachable index', HexUtil.toAddress(cursor), HexUtil.toAddress(cursor + length));
			return;
		}
		this._stream.seek(cursor, 'begin');
		const beforeValues = this._stream.peak(length);
		this._stream.remove(length);
		this.moveCursor(cursor);
		// undo
		this._undo.add('remove')
			.undo(() => {
				this._stream.seek(cursor, 'begin');
				this._stream.insert(beforeValues);
				this.moveCursor(cursor);
			})
			.redo(() => {
				this._stream.seek(cursor, 'begin');
				this._stream.remove(beforeValues.length);
				this.moveCursor(cursor);
			});
	}

	toggleMode () {
		this._mode = this._mode === 'update' ? 'insert' : 'update';
	}

	isSelected () {
		return this._stream.isInside(this._selectBegin)
			&& this._stream.isInside(this._selectEnd)
			&& this._selectBegin < this._selectEnd;
	}

	isInsert (cursor) {
		const tail = this._stream.length <= cursor;
		const even = this._mode === 'insert' && (cursor % 2) === 0;
		return tail || even;
	}

	_selectedValues () {
		return this._getValues(this._selectBegin, this._selectEnd - this._selectBegin);
	}

	_getValues (begin, length) {
		this._stream.seek(begin, 'begin');
		return this._stream.peak(length);
	}

	_toClipboard (clipboard, values) {
		clipboard.setData('text/plain', values);
	}

	_fromClipboard (clipboard) {
		return clipboard.getData('text/plain');
	}
}
