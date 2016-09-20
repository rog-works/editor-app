'use strict';

class Hex extends Page {
	constructor () {
		super();
		this.KEY_CODE_S = 83;
		this.STATE_SYNCRONIZED = 'syncronized';
		this.STATE_MODIFIED = 'modified';
		this.ICON_STATE_SYNCRONIZED = 'fa-table';
		this.ICON_STATE_MODIFIED = 'fa-check-circle';

		// state
		this.state = this.STATE_SYNCRONIZED;
		this.icon[this.ICON_STATE_SYNCRONIZED] = ko.observable(true);
		this.icon[this.ICON_STATE_MODIFIED] = ko.observable(false);

		this.path = '#';
		this.rows = HexRows.mixin(ko.observableArray([]));
		this.editor = new HexEditor();
		this.focused = ko.observable(false);
	}

	static init () {
		const self = new Hex();
		// self.load();
		// self._editor().on('change', () => { self.changed(); });
		return self;
	}

	load (path = '#', content = '') {
		const stream = new Stream(content);
		this._transition(this.STATE_LOADING);
		this.path = path;
		this.rows.load(stream);
		this.editor.load(stream);
		this._transition(this.STATE_SYNCRONIZED);
	}

	focus () {
		console.log('On focus', this.focused());
		this.focused(true);
	}

	resize (width, height) {
		super.resize(width, height);
		this.rows.resize(width, height);
	}

	keydown (self, e) {
		console.log('On keydown', e.keyCode, e.ctrlKey, e.shiftKey);
		if (!this.editor.onKeydown(e.keyCode, e.ctrlKey, e.shiftKey)) {
			this.rows.changed();
			return false;
		} else {
			return true;
		}
	}

	copy (self, e) {
		console.log('On copy');
		return this.editor.onCopy(e.originalEvent.clipboardData);
	}

	cut (self, e) {
		console.log('On cut');
		return this.editor.onCut(e.originalEvent.clipboardData);
	}

	paste (self, e) {
		console.log('On paste');
		return this.editor.onPaste(e.originalEvent.clipboardData);
	}

	scroll (self, e) {
		this.rows.scrollY(e.target.scrollTop);
		return true;
	}

	save () {
		this._transition(this.STATE_LOADING);
		this.fire('updateEntry', this.path, this.rows.stream.source);
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

class HexRows {
	constructor () {
		// XXX
		this.ROW_SIZE_H = 16;

		this._localPos = 0;
		this._globalPos = 0;
		this._stream = new Stream();

		// layout
		this.position = {
			top: ko.observable(0)
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
			'hexAt',
			'toGlobalPos',
			'toByteOfGlobalPos',
			'load',
			'clear',
			'resize',
			'changed',
			'scrollY',
			'moveRow'
		].forEach((key) => {
			obj[key] = self[key].bind(obj);
		});
		return obj;
	}

	hexAt (localPos) {
		if (this._stream.isInside(localPos)) {
			return this._stream.read(this.toGlobalPos(localPos), 1).toUpperCase();
		} else {
			return '-';
		}
	}

	toGlobalPos (localPos) {
		return (HexUtil.toRowPos(this._globalPos) * 32) + localPos;
	}

	// XXX
	toByteOfGlobalPos (localPos) {
		return this._globalPos + localPos;
	}

	load (stream) {
		this._globalPos = 0;
		this._stream = stream;
		this.position.top(0);
		this.resize(this.size.width, this.size.height);
	}

	clear () {
		this.removeAll();
	}

	resize (width, height) {
		// resize
		this.size.width = width;
		this.size.height = height;
		const globalRowNum = ~~((this._stream.length + 31) / 32);
		this.globalSize.width(width);
		this.globalSize.height(globalRowNum * this.ROW_SIZE_H);

		// reallocate
		const rows = this();
		const localRowNum = Math.min(~~(height / this.ROW_SIZE_H), globalRowNum);
		const diffRowNum = localRowNum - rows.length;
		if (diffRowNum > 0) {
			const beforeRowPos = rows.length;
			for (let i = 0; i < diffRowNum; i += 1) {
				this.push(new HexRow(this, beforeRowPos + i));
			}
		} else if (diffRowNum < 0) {
			for (let i = 0; i < Math.abs(diffRowNum); i += 1) {
				this.pop();
			}
		}

		// reindex
		this.moveRow(HexUtil.toRowPos(this._globalPos));
	}

	changed () {
		this.moveRow(HexUtil.toRowPos(this._globalPos));
	}

	scrollY (posY) {
		const globalRowPos = HexUtil.toRowPos(posY);
		this.position.top(posY);
		this.moveRow(globalRowPos);
	}

	moveRow (globalRowPos) {
		const diffRowPos = globalRowPos - HexUtil.toRowPos(this._globalPos);
		this._globalPos = HexUtil.toPos(globalRowPos);

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
			row.update();
		}
	}
}

class HexRow {
	constructor (rows, localRowPos) {
		this._rows = rows;
		this._localPos = HexUtil.toPos(localRowPos);
		this.columns = [];
		this.address = ko.observable('');
		this.text = ko.observable('');
		this.load();
	}

	get rows () {
		return this._rows;
	}

	get localPos () {
		return this._localPos;
	}

	get localRowPos () {
		return HexUtil.toRowPos(this._localPos);
	}

	set localRowPos (value) {
		this._localPos = HexUtil.toPos(value);
	} 

	hexAt (x) {
		return this._rows.hexAt(this.toLocalPos(x));
	}

	toLocalPos (x) {
		return (this.localRowPos * 32) + x;
	}

	toGlobalPos (x) {
		return this._rows.toGlobalPos(this.toLocalPos(x));
	}

	load () {
		for (let x = 0; x < 32; x += 1) {
			this.columns.push(new HexColumn(this, x));
		}
		this.address(HexUtil.toAddress(this._rows.toByteOfGlobalPos(this._localPos)));
		this.text(HexUtil.byteToStr(this._bytes()));
	}

	update () {
		for (const column of this.columns) {
			column.update();
		}
		this.address(HexUtil.toAddress(this._rows.toByteOfGlobalPos(this._localPos)));
		this.text(HexUtil.byteToStr(this._bytes()));
	}

	_bytes () {
		let bytes = [];
		for (let x = 0; x < 16; x += 1) {
			const columnH = this.columns[x * 2 + 0];
			const columnL = this.columns[x * 2 + 1];
			if (!columnH.available) {
				break;
			}
			bytes.push((columnH.value << 4) | columnL.value);
		}
		return bytes;
	}
}

class HexColumn {
	constructor (row, posX) {
		this._row = row;
		this._posX = posX;
		this._value = null;
		this.hex = ko.observable('-');
		this.css = {};
		this.globalPos = ko.observable(0);
	}

	get value () {
		return this._value;
	}

	get available () {
		return this._value !== null;
	}

	update () {
		const hex = this._row.hexAt(this._posX);
		if (this.hex() !== hex) {
			this.hex(hex);
			this._value = hex !== '-' ? HexUtil.toByte(hex) : null;
		}
		// XXX
		this.globalPos(this._row.toGlobalPos(this._posX));
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
