'use strict';

class Hex extends Page {
	constructor () {
		super();
		this.KEY_CODE_S = 83;
		this.STATE_SYNCRONIZED = 'syncronized';
		this.STATE_MODIFIED = 'modified';
		this.ICON_STATE_SYNCRONIZED = 'fa-table';
		this.ICON_STATE_MODIFIED = 'fa-check-circle';

		this.path = '#';
		this.rows = HexRows.mixin(ko.observableArray([]));
		this.editor = new HexEditor();
		this.state = this.STATE_SYNCRONIZED;
		this.icon[this.ICON_STATE_SYNCRONIZED] = ko.observable(true);
		this.icon[this.ICON_STATE_MODIFIED] = ko.observable(false);
		// XXX
		this.load(this.rows);
		this.focused = ko.observable(false);
	}

	click () {
		console.log('on click');
		$('#dummy').focus();
	}
	
	focusin () {
		console.log('on focusin');
		$('.hex').click();
		console.log('click', $('.hex').length);
	}
	
	focusout () {
		console.log('on focusout');
	}

	static init () {
		const self = new Hex();
		// self.load();
		// self._editor().on('change', () => { self.changed(); });
		return self;
	}

	// FIXME
	cursor () {
		return this.editor.localCursor;
	}

	load (path = '#', content = '') {
		this._transition(this.STATE_LOADING);
		this.path = path;
		this.rows.load(content);
		this.editor.load(this.rows);
		this._transition(this.STATE_SYNCRONIZED);
	}

	focus () {
		// this._editor().focus();
	}

	resize (width, height) {
		super.resize(width, height);
		this.rows.resize(width, height);
	}

	keydown (self, e) {
		console.log('on keydown', e.keyCode);
		if (!this.editor.onKeydown(e.keyCode)) {console.log('to changed');
			this.rows.changed();
			return false;
		} else {
			return true;
		}
	}

	copy (self, e) {
		console.log('on copy');
		return this.editor.onCopy(e.originalEvent.clipboardData);
	}

	cut (self, e) {
		console.log('on cut');
		return this.editor.onCut(e.originalEvent.clipboardData);
	}

	paste (self, e) {
		console.log('on paste');
		return this.editor.onPaste(e.originalEvent.clipboardData);
	}

	scroll (self, e) {
		this.rows.scrollY(e.target.scrollTop);
		return true;
	}

	save () {
		this._transition(this.STATE_LOADING);
		this.fire('updateEntry', this.path, this.rows.hexBytes);
	}

	saved (updated) {
		this._transition(updated ? this.STATE_SYNCRONIZED : this.STATE_MODIFIED);
	}

	changed () {
		if (this.state === this.STATE_SYNCRONIZED) {
			this._transition(this.STATE_MODIFIED);
		}
	}

	beforeLoad () {
		this._transition(this.STATE_LOADING);
	}

	_transition (state) {
		super._transition(state);
		this.state = state;
		if (state === this.STATE_MODIFIED) {
			this.icon[this.ICON_STATE_MODIFIED](true);
		} else if (state === this.STATE_SYNCRONIZED) {
			this.icon[this.ICON_STATE_SYNCRONIZED](true);
		}
	}
}

class UndoBuffer {
	constructor (tag, before, after, apply, restore) {
		this.tag = tag;
		this.before = before;
		this.after = after;
		this.apply = apply;
		this.restore = restore;
	}
}

class Undo extends Array {
	constructor () {
		super();
		this.curr = 0;
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
		this.curr = Math.min(Math.max(this.curr - 1, 0), this.length - 1);
		const undo = this._at(this.curr);
		if (undo !== null) {
			undo.restore(undo.tag, undo.before, undo.after);
		}
	}

	redo () {
		this.curr = Math.min(Math.max(this.curr + 1, 0), this.length - 1);
		const undo = this._at(this.curr);
		if (undo !== null) {
			undo.apply(undo.tag, undo.before, undo.after);
		}
	}

	hasUndo () {
		return this.curr > 0;
	}

	hasRedo () {
		return this.curr < this.length;
	}

	_at (index) {
		if (index < this.length) {
			return this[index];
		}
		return null;
	}
}

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

		this.rows = null;
		this.mode = 'update';
		this.cursor = 0;
		this.localCursor = 0;
		this.selectBefore = 0;
		this.selectEnd = 0;
		this.undo = new Undo();
	}

	load (rows) {
		// XXX
		this.rows = rows;
		this.mode = 'update';
		this.cursor = 0;
		this.unselect();
		this.undo.clear();
	}

	unselect () {
		this.selectBefore = 0;
		this.selectEnd = 0;
	}

	onCopy (clipboard) {
		if (this.isSelected()) {
			this._toClipboard(clipboard, this._selectedHexValues());
			return false;
		} else {
			return true;
		}
	}

	onCut (clipboard) {
		if (this.isSelected()) {
			this._toClipboard(clipboard, this._selectedHexValues());
			this.bulkDelete(this.selectBefore, this.selectEnd - this.selectBefore);
			this.unselect();
			return false;
		} else {
			return true;
		}
	}

	onPaste (clipboard) {
		if (this.isSelected()) {
			this.bulkDelete(this.selectBefore, this.selectEnd - this.selectBefore);
			this.unselect();
		}
		this.blukInsert(this.cursor, this._fromClipboard(clipboard));
		return false;
	}

	onKeydown (keyCode, isCtrl) {
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
				return this._onKeydownArrow(keyCode);
			case this.KEY_CODE_DELETE:
			case this.KEY_CODE_BACKSPACE:
				return this._onKeydownDelete(keyCode);
			case this.KEY_CODE_INSERT:
				return this._onKeydownInsert();
			case this.KEY_CODE_UNDO:
				return isCtrl && this._onKeydownUndo();
			case this.KEY_CODE_REDO:
				return isCtrl && this._onKeydownRedo();
			case this.KEY_CODE_SAVE:
				return isCtrl && this._onKeydownSave();
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
		const value = allows.indexOf(keyCode);
		this.upsert(this.cursor, value.toString(16).toUpperCase());
		return false;
	}

	_onKeydownArrow (keyCode) {
		const allows = {
			[this.KEY_CODE_LEFT]: -1,
			[this.KEY_CODE_UP]: -16,
			[this.KEY_CODE_RIGHT]: 1,
			[this.KEY_CODE_DOWN]: 16
		};
		this.moveCursor(this.cursor + allows[keyCode]);
		return false;
	}

	_onKeydownDelete (keyCode) {
		if (this.isSelected()) {
			this.bulkDelete(this.selectBefore, this.selectEnd - this.selectBefore);
		} else {
			this.delete(this.cursor, keyCode === this.KEY_CODE_BACKSPACE);
		}
		return false;
	}

	_onKeydownUndo () {
		this.undo.undo();
		return false;
	}

	_onKeydownRedo () {
		this.undo.redo();
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

	moveCursor (cursor) {
		this.cursor = Math.min(Math.max(cursor, 0), this.rows.hexBytes.length);
		this.localCursor = this.cursor - this.rows.globalPos;
	}

	upsert (cursor, hex) {
		if (this.isInsert()) {
			this.insert(cursor, hex);
		} else {
			this.update(cursor, hex);
		}
	}

	update (cursor, hex) {
		if (this.isInside(cursor)) {
			const before = ~~(cursor / 2) * 2;
			const head = this.rows.hexBytes.substr(0, before);
			const tail = this.rows.hexBytes.substr(before + 2);
			const high = (cursor % 2) === 0 ? hex : this.rows.hexBytes.substr(before, 1);
			const low = (cursor % 2) === 0 ? '0' : hex;
			this.rows.hexBytes = head + high + low + tail;
			this.moveCursor(cursor + 1);
		} else {
			console.warn('Unreachable index', HexUtil.toAddress(cursor));
		}
	}

	insert (cursor, hex) {
		this.bulkInsert(cursor, `${hex}0`);
		this.moveCursor(cursor + 1);
	}

	bulkInsert (cursor, hexValues) {
		if (cursor <= 0) {
			this.rows.hexBytes = hexValues + this.rows.hexBytes;
		} else if (this.rows.hexBytes.length <= cursor) {
			this.rows.hexBytes = this.rows.hexBytes + hexValues;
		} else {
			const head = this.rows.hexBytes.substr(0, cursor);
			const tail = this.rows.hexBytes.substr(cursor);
			this.rows.hexBytes = head + hexValues + tail;
		}
		this.moveCursor(cursor + hexValues.length);
	}

	delete (cursor, toBack = false) {
		this.bulkDelete(toBack ? cursor - 2 : cursor, 2);
	}

	bulkDelete (before, length) {
		if (!this.isInside(before)) {
			console.warn('Unreachable index', HexUtil.toAddress(before), HexUtil.toAddress(before + length));
			return;
		}
		const head = this.rows.hexBytes.substr(0, before);
		const tail = this.rows.hexBytes.substr(before + length);
		this.rows.hexBytes = head + tail;
		this.moveCursor(before);
	}

	toggleMode () {
		this.mode = this.mode === 'update' ? 'insert' : 'update';
	}

	isSelected () {
		return this.isInside(this.selectBefore) && this.isInside(this.selectEnd) && this.selectBefore < this.selectEnd;
	}

	isInsert () {
		const tail = this.rows.hexBytes.length <= this.cursor;
		const even = this.mode === 'insert' && (this.cursor % 1) === 0;
		return tail || even;
	}

	isInside (cursor) {
		return cursor >= 0 && this.rows.hexBytes.length > cursor;
	}

	_selectedHexValues () {
		return this._getHexValues(this.selectBefore, this.selectEnd - this.selectBefore);
	}

	_getHexValues (before, length) {
		if (this.isInside(before)) {
			console.warn('Unreachable index', HexUtil.toAddress(before), HexUtil.toAddress(before + length));
			return '';
		}
		return this.rows.hexBytes.substr(before, length);
	}

	_toClipboard (clipboard, hexValues) {
		clipboard.setData('text/plain', hexValues);
	}

	_fromClipboard (clipboard) {
		return clipboard.getData('text/plain');
	}
}

class HexUtil {
	static toAddress (value) {
		return `00000000${value.toString(16).toUpperCase()}`.slice(-8);
	}

	static toRowPos (pos) {
		return ~~(pos / 16);
	}

	static toPos (rowPos) {
		return rowPos * 16;
	}

	static toHex (byte) {
		return `00${byte.toString(16).toUpperCase()}`.slice(-2);
	}

	static toByte (hex) {
		return parseInt(hex, 16);
	}

	static toText (hexBytes) {
		const bytes = HexUtil.hexToBytes(hexBytes);
		return HexUtil.byteToStr(bytes);
	}

	static hexToBytes (hexBytes) {
		const bytes = [];
		for (const i = 0; i < hexBytes.length; i += 2) {
			bytes.push(HexUtil.toByte(hexBytes.substr(i, 2)));
		}
		return bytes;
	}

	static byteToStr (bytes, encode = 'UTF8') {
		return HexUtil[`byteToStr${encode}`](bytes);
	}

	// FIXME
	static byteToStrSJIS (bytes) {
		let str = '';
		for (let i = 0; i < bytes.length; i += 1) {
			const byte = HexUtil._readByte(bytes, i);
			if (byte <= 0x7f) {
				str += String.fromCharCode(byte);
			} else {
				const chara = (HexUtil._readByte(i + 1) << 8) | byte;
				str += String.fromCharCode(chara);
				i += 1;
			}
		}
		return str;
	}

	static byteToStrUTF8 (bytes) {
		let str = '';
		for (let i = 0; i < bytes.length; i += 1) {
			const byte = HexUtil._readByte(bytes, i);
			if (byte <= 0x7f) {
				str += String.fromCharCode(byte);
			} else if (byte <= 0xdf) {
				let chara = ((byte & 0x1f) << 6);
				chara += (HexUtil._readByte(i + 1) & 0x3f);
				str += String.fromCharCode(chara);
				i += 1;
			} else if (i <= 0xe0) {
				let chara = 0x800 | ((HexUtil._readByte(i + 1) & 0x1f) << 6);
				chara += (HexUtil._readByte(i + 2) & 0x3f);
				str += String.fromCharCode(chara);
				i += 2;
			} else {
				let chara = ((byte & 0x0f) << 12);
				chara += ((HexUtil._readByte(i + 1) & 0x3f) << 6);
				chara += (HexUtil._readByte(i + 2) & 0x3f);
				str += String.fromCharCode(chara);
				i += 2;
			}
		}
		return str;
	}

	static _readByte (bytes, offset) {
		return bytes.length > offset ? bytes[offset] : 0;
	}
}

class HexRows {
	constructor () {
		// XXX
		this.FONT_SIZE_H = 12;

		this.localPos = 0;
		this.globalPos = 0;
		this.hexBytes = '';
		this.position = {
			top:  ko.observable(0)
		};
		// XXX
		this.size = {
			width: 360,
			height: 640
		};
		// XXX
		this.globalSize = {
			width: ko.observable(360),
			height: ko.observable(640)
		};
	}

	static mixin (obj) {
		const self = new HexRows();
		for (const key in self) {
			if (self.hasOwnProperty(key)) {
				obj[key] = self[key];
			}
		}
		// XXX
		[
			'load',
			'clear',
			'hexAt',
			'resize',
			'changed',
			'scrollY',
			'moveRow'
		].forEach((key) => {
			obj[key] = self[key].bind(obj);
		});
		return obj;
	}

	load (hexBytes) {
		this.position.top(0);
		this.localPos = 0;
		this.globalPos = 0;
		this.hexBytes = hexBytes;
		this.resize(this.size.width, this.size.height);
	}

	clear () {
		this.removeAll();
	}

	hexAt (globalPos) {
		const strPos = globalPos * 2;
		if (strPos >= 0 && this.hexBytes.length > strPos + 1) {
			return this.hexBytes.substr(strPos, 2).toUpperCase();
		} else {
			return '--';
		}
	}

	resize (width, height) {
		// resize
		this.size.width = width;
		this.size.height = height;
		const globalRowNum = ~~((this.hexBytes.length + 31) / 32);
		this.globalSize.width(width);
		this.globalSize.height(globalRowNum * this.FONT_SIZE_H);

		// reallocate
		this.clear();
		const localRowNum = ~~(height / this.FONT_SIZE_H);
		for (let localRowPos = 0; localRowPos < localRowNum; localRowPos += 1) {
			this.push(new HexRow(this, localRowPos));
		}

		// reindex
		this.moveRow(HexUtil.toRowPos(this.globalPos));
	}

	changed () {
		this.moveRow(HexUtil.toRowPos(this.globalPos));
	}

	scrollY (posY) {
		const globalRowPos = HexUtil.toRowPos(posY);
		this.position.top(posY);
		this.moveRow(globalRowPos);
	}

	moveRow (globalRowPos) {
		const diffRowPos = globalRowPos - HexUtil.toRowPos(this.globalPos);
		this.globalPos = HexUtil.toPos(globalRowPos);

		// sorted rows
		if (diffRowPos !== 0) {
			const rows = this();
			for (const row of rows) {
				row.localRowPos = (row.localRowPos + rows.length - diffRowPos) % rows.length;
			}
			this.sort((a, b) => {
				return a.localRowPos - b.localRowPos;
			});
		}

		// reindex
		for (const row of this()) {
			row.moveRow(globalRowPos);
		}
	}
}

class HexRow {
	constructor (rows, localRowPos) {
		this.rows = rows;
		this.columns = [];
		this.localRowPos = localRowPos;
		this.globalRowPos = this.localRowPos;
		this.address = ko.observable(HexUtil.toAddress(HexUtil.toPos(this.globalRowPos)));
		this.text = ko.observable();
		this.load();
	}

	load () {
		for (let x = 0; x < 16; x += 1) {
			const column = new HexColumn(this, x);
			this.columns.push(column);
		}
		this.text(HexUtil.byteToStr(this._bytes()));
	}

	moveRow (globalRowPos) {
		this.globalRowPos = globalRowPos;
		for (const column of this.columns) {
			column.moveRow(this.globalRowPos + this.localRowPos);
		}
		this.address(HexUtil.toAddress(HexUtil.toPos(this.globalRowPos + this.localRowPos)));
		this.text(HexUtil.byteToStr(this._bytes()));
	}

	_bytes () {
		let bytes = [];
		for (const column of this.columns) {
			if (!column.available()) {
				break;
			}
			bytes.push(column.byte);
		}
		return bytes;
	}
}

class HexColumn {
	constructor (row, localPos) {
		this.rows = row.rows;
		this.row = row;
		this.localPos = localPos;
		this.globalPos = this.localPos;
		this.hex = ko.observable('--');
		this.byte = null;
		this.css = {};
		this.update(this.globalPos);
	}

	available () {
		return this.byte !== null;
	}

	update (globalPos) {
		this.globalPos = globalPos;
		const hex = this.rows.hexAt(this.globalPos);
		const byte = hex !== '--' ? HexUtil.toByte(hex) : null;
		if (this.hex() !== hex) {
			this.hex(hex);
			this.byte = byte;
		}
	}

	moveRow (globalRowPos) {
		const globalPos = HexUtil.toPos(globalRowPos) + this.localPos;
		this.update(globalPos);
	}

	localPos2 () {
		return this.row.localPos + this.localPos;
	}
}
