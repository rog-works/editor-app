import * as ko from 'knockout-es5';
import {KeyCodes} from './KeyMap';
import {Stream} from '../io/Stream';

enum KeyRole {
	Copy = KeyCodes.C,
	Cut = KeyCodes.X,
	Paste = KeyCodes.P,
	Remove = KeyCodes.Delete,
	Backspace = KeyCodes.Backspace,
	Insert = KeyCodes.Insert,
	Undo = KeyCodes.Z,
	Redo = KeyCodes.Y,
	Save = KeyCodes.S
}

enum Modes {
	Update
}

export default class HexEditor {
	public constructor(
		private _stream: Stream | null = null, // XXX nullable
		private _mode: Modes = Modes.Updatel
		public cursor: number = 0,
		private _selectBegin: number = -1,
		private _selectEnd: number = -1,
		private _undo: Undo = new Undo();
	) {
		ko.track(this);
	}

	public get selectBegin(): number {
		return this._selectBegin;
	}

	public get selectEnd(): number {
		return this._selectEnd;
	}

	public load(stream: Stream): void {
		this._stream = stream;
		this._mode = Modes.Uupdate;
		this.cursor = 0;
		this._undo.clear();
		this.unselect();
	}

	public unselect(): void {
		this._selectBegin = -1;
		this._selectEnd = -1;
	}

	public onCopy(clipboard: ClipboardEvent): boolean { // FIXME
		if (this.isSelected) {
			this._toClipboard(clipboard, this._selectedValues());
			return false;
		} else {
			return true;
		}
	}

	public onCut(clipboard: ClipboardEvent): boolean {
		if (this.isSelected) {
			this._toClipboard(clipboard, this._selectedValues());
			this.bulkRemove(this._selectBegin, this._selectEnd - this._selectBegin);
			this.unselect();
			return false;
		} else {
			return true;
		}
	}

	public onPaste(clipboard: ClipboardEvent): boolean {
		if (this.isSelected) {
			this.bulkRemove(this._selectBegin, this._selectEnd - this._selectBegin);
			this.unselect();
		}
		this.bulkInsert(this.cursor, this._fromClipboard(clipboard));
		return false;
	}

	public onKeydown(keyCode: KeyCodes, isCtrl: boolean, isShift: boolean): boolean {
		 if (isShift) {
			switch (keyCode) {
				case KeyCodes.Left:
				case KeyCodes.Up:
				case KeyCodes.Right:
				case KeyCodes.Down:
					return this._onKeydownSelectMove(keyCode);
				case KeyCodes.F:
				case KeyCodes.B:
					return isCtrl && this._onKeydownSelectMove(keyCode);
			}
		} else if (isCtrl) {
			switch (keyCode) {
				case KeyCodes.F:
				case KeyCodes.B:
					return this._onKeydownMove(keyCode);
				case KeyCodes.Undo:
					return this._onKeydownUndo();
				case KeyCodes.Redo:
					return this._onKeydownRedo();
				case KeyCodes.Save:
					return this._onKeydownSave();
			}
		} else if (!isCtrl && !isShift) {
			switch (keyCode) {
				case KeyCodes.0:
				case KeyCodes.1:
				case KeyCodes.2:
				case KeyCodes.3:
				case KeyCodes.4:
				case KeyCodes.5:
				case KeyCodes.6:
				case KeyCodes.7:
				case KeyCodes.8:
				case KeyCodes.9:
				case KeyCodes.A:
				case KeyCodes.B:
				case KeyCodes.C:
				case KeyCodes.D:
				case KeyCodes.E:
				case KeyCodes.F:
					return this._onKeypressUpdate(keyCode);
				case KeyCodes.Left:
				case KeyCodes.Up:
				case KeyCodes.Right:
				case KeyCodes.Down:
					return this._onKeydownMove(keyCode);
				case KeyCodes.Remove:
				case KeyCodes.Backspace:
					return this._onKeydownRemove(keyCode);
				case KeyCodes.Insert:
					return this._onKeydownInsert();
			}
		}
		return true;
	}

	private _onKeypressUpdate(keyCode: KeyCodes): boolean {
		const allows = [
			KeyCodes.0,
			KeyCodes.1,
			KeyCodes.2,
			KeyCodes.3,
			KeyCodes.4,
			KeyCodes.5,
			KeyCodes.6,
			KeyCodes.7,
			KeyCodes.8,
			KeyCodes.9,
			KeyCodes.A,
			KeyCodes.B,
			KeyCodes.C,
			KeyCodes.D,
			KeyCodes.E,
			KeyCodes.F
		];
		const hex = allows.indexOf(keyCode).toString(16).toUpperCase();
		if (this.isInsert(this.cursor)) {
			this.insert(this.cursor, hex);
		} else {
			this.update(this.cursor, hex);
		}
		return false;
	}

	private _onKeydownMove(keyCode: KeyCodes): boolean {
		const allows = {
			[KeyCodes.LEFT]: -1,
			[KeyCodes.UP]: -32,
			[KeyCodes.RIGHT]: 1,
			[KeyCodes.DOWN]: 32,
			// XXX
			[KeyCodes.F]: 32 * 16,
			[KeyCodes.B]: -32 * 16,
		};
		this.unselect();
		this.moveCursor(this.cursor + allows[keyCode]);
		return false;
	}

	_onKeydownSelectMove (keyCode) {
		const allows = {
			[KeyCodes.LEFT]: -1,
			[KeyCodes.UP]: -32,
			[KeyCodes.RIGHT]: 1,
			[KeyCodes.DOWN]: 32,
			// XXX
			[KeyCodes.F]: 32 * 16,
			[KeyCodes.B]: -32 * 16,
		};
		const prev = this.cursor;
		const next = this._getNextCursor(this.cursor + allows[keyCode]);
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

	private _onKeydownRemove(keyCode: KeyCodes): boolean {
		if (this.isSelected) {
			this.bulkRemove(this._selectBegin, this._selectEnd - this._selectBegin);
			this.unselect();
		} else {
			this.remove(this.cursor, keyCode === KeyCodes.BACKSPACE);
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
