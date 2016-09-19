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
		// - delete
		this.KEY_CODE_DELETE = 46;
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
		this._selectBefore = -1;
		this._selectEnd = -1;
		this._undo = new Undo();
	}

	get selectBefore () {
		return this._selectBefore;
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
		this._selectBefore = -1;
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
			this.bulkDelete(this._selectBefore, this._selectEnd - this._selectBefore);
			this.unselect();
			return false;
		} else {
			return true;
		}
	}

	onPaste (clipboard) {
		if (this.isSelected()) {
			this.bulkDelete(this._selectBefore, this._selectEnd - this._selectBefore);
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
				case this.KEY_CODE_DELETE:
				case this.KEY_CODE_BACKSPACE:
					return this._onKeydownDelete(keyCode);
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
		const initialMoved = this._selectBefore === -1;
		// XXX
		if (initialMoved) {
			const before = toBack ? next : prev;
			const end = toBack ? prev : next;
			this._selectBefore = Math.min(before, this._stream.length);
			this._selectEnd = Math.max(end, 0);
		} else {
			if (this._selectBefore > next) {
				this._selectBefore = next;
			} else if (this._selectEnd < next) {
				this._selectEnd = next;
			} else if (toBack) {
				this._selectEnd = next;
			} else {
				this._selectBefore = next;
			}
		}
		this.moveCursor(next);
		return false;
	}

	_onKeydownDelete (keyCode) {
		if (this.isSelected()) {
			this.bulkDelete(this._selectBefore, this._selectEnd - this._selectBefore);
		} else {
			this.delete(this.cursor(), keyCode === this.KEY_CODE_BACKSPACE);
		}
		return false;
	}

	_onKeydownUndo () {
		this._undo.undo();
		return false;
	}

	_onKeydownRedo () {
		this._undo.redo();
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
		if (this._stream.length < cursor) {
			console.warn('Unreachable index', HexUtil.toAddress(cursor));
			return;
		}
		const before = ~~(cursor / 2) * 2;
		const inserted = (cursor % 2) === 0;
		const high = inserted ? hex : this._stream.read(before, 1);
		const low = inserted ? '0' : hex;
		this._stream.write(high + low, before);
		this.moveCursor(cursor + 1);
	}

	insert (cursor, hex) {
		this._stream.insert(`${hex}0`, cursor);
		this.moveCursor(cursor + 1);
	}

	bulkInsert (cursor, hexValues) {
		this._stream.insert(hexValues, cursor);
		this.moveCursor(cursor + hexValues.length);
	}

	delete (cursor, toBack = false) {
		const before = toBack ? cursor - 2 : cursor;
		this.bulkDelete(before, 2);
	}

	bulkDelete (before, length) {
		if (!this._stream.isInside(before)) {
			console.warn('Unreachable index', HexUtil.toAddress(before), HexUtil.toAddress(before + length));
			return;
		}
		this._stream.remove(before, length);
		this.moveCursor(before);
	}

	toggleMode () {
		this._mode = this._mode === 'update' ? 'insert' : 'update';
	}

	isSelected () {
		return this._stream.isInside(this._selectBefore)
			&& this._stream.isInside(this._selectEnd)
			&& this._selectBefore < this._selectEnd;
	}

	isInsert (cursor) {
		const tail = this._stream.length <= cursor;
		const even = this._mode === 'insert' && (cursor % 2) === 0;
		return tail || even;
	}

	_selectedValues () {
		return this._getValues(this._selectBefore, this._selectEnd - this._selectBefore);
	}

	_getValues (before, length) {
		if (!this._stream.isInside(before)) {
			console.warn('Unreachable index', HexUtil.toAddress(before), HexUtil.toAddress(before + length));
			return '';
		}
		return this._stream.read(before, length);
	}

	_toClipboard (clipboard, values) {
		clipboard.setData('text/plain', values);
	}

	_fromClipboard (clipboard) {
		return clipboard.getData('text/plain');
	}
}
