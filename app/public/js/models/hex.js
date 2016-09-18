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
		this.state = this.STATE_SYNCRONIZED;
		this.icon[this.ICON_STATE_SYNCRONIZED] = ko.observable(true);
		this.icon[this.ICON_STATE_MODIFIED] = ko.observable(false);
	}

	static init () {
		const self = new Hex();
		// self.load();
		// self._editor().on('change', () => { self.changed(); });
		return self;
	}

	resize (width, height) {
		super.resize(width, height);
		this.rows.resize(width, height);
	}

	load (path = '#', content = '') {
		this._transition(this.STATE_LOADING);
		this.path = path;
		this.rows.load(content);
		this._transition(this.STATE_SYNCRONIZED);
	}

	focus () {
		// this._editor().focus();
	}

	keydown (self, e) {
		if (e.ctrlKey || e.metaKey) {
			// handling ctrl + s
			if (e.keyCode === this.KEY_CODE_S) {
				this.save();
				return false;
			}
		}
		return true;
	}

	scroll (self, e) {
		this.rows.scrollY(e.target.scrollTop);
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
}
