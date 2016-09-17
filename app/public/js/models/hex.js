'use strict';

class Hex extends Page {
	constructor () {
		super();
		this.KEY_CODE_S = 83;
		this.KEY_CODE_INVALIDS = [82, 87]; // R and W
		this.STATE_SYNCRONIZED = 'syncronized';
		this.STATE_MODIFIED = 'modified';
		this.ICON_STATE_SYNCRONIZED = 'fa-table';
		this.ICON_STATE_MODIFIED = 'fa-check-circle';

		this.realSize = {
			width: ko.observable(this.size.width),
			height: ko.observable(this.size.height)
		};
		this.path = '#';
		this.content = '';
		this.offset = 0;
		this.rows = (new HexRows()).mixin(ko.observableArray([]));
		this.addNode(this.rows);
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
		this.realSize.height = this.rows.realSize.height;
	}

	load (path = '#', content = '') {
		self._transition(this.STATE_LOADING);
		self.path = path;
		self.content = content;
		self._transition(this.STATE_SYNCRONIZED);
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
			// XXX
			} else if (this.KEY_CODE_INVALIDS.indexOf(e.keyCode) !== -1) {
				return false;
			}
		}
		return true;
	}

	save () {
		this._transition(this.STATE_LOADING);
		this.fire('updateEntry', this.path, this.content);
	}

	saved (updated) {
		this._transition(updated ? this.STATE_SYNCRONIZED : this.STATE_MODIFIED);
	}

	changed () {
		if (this.state === this.STATE_SYNCRONIZED) {
			this._transition(this.STATE_MODIFIED);
		}
	}

	beforeLoad (path) {
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
		this.FONT_SIZE_H = 18;

		this.pos = 0;
		this.hexBytes = '';
		// XXX
		this.realSize = {
			width: 360,
			height: 640
		};
	}
	
	mixin (self) {
		self.pos = this.pos;
		self.hexBytes = this.hexBytes;
		self.load = this.load.bind(self);
		self.clear = this.clear.bind(self);
		self.hexAt = this.hexAt.bind(self);
		self.resize = this.resize.bind(self);
		self.move = this.move.bind(self);
	}

	load (hexBytes = '') {
		this.pos = 0;
		this.hexBytes = hexBytes;
		this.move(0);
	}

	clear () {
		this.removeAll();
	}

	hexAt (pos) {
		if (pos >= 0 && this.hexBytes.length > pos * 2 + 1) {
			return this.hexBytes.substr(pos * 2, 2);
		} else {
			// FIXME
			return 'AA';
		}
	}

	resize (width, height) {
		const yNum = ~~(height / this.FONT_SIZE_H);
		this.clear();
		for (let y = 0; y < yNum; y += 1) {
			this.push(new HexRow(this, y * 16));
		}
		this.move(this.pos);
		const realYNum = ~~((this.hexBytes.length + 31) / 32);
		this.realSize.height = realYNum * this.FONT_SIZE_H;
	}

	move (offset) {
		this.forEach((row) => {
			row.move(offset);
		});
	}
}

class HexRow extends Array {
	constructor (rows, pos) {
		super();
		this.rows = rows;
		this.pos = pos;
		this.resize();
	}

	resize () {
		this.clear();
		for (let x = 0; x < 16; x += 1) {
			this.push(new HexColumn(this, this.pos + x));
		}
		this.move(0);
	}
	
	clear () {
		while (this.length > 0) {
			this.pop();
		}
	}

	move (offset) {
		this.forEach((column) => {
			column.move(this.pos + offset);
		});
	}
}

class HexColumn {
	constructor (row, pos) {
		this.rows = row.rows;
		this.row = row;
		this.pos = pos;
		// FIXME
		this.hex = ko.observable('AA');
		this.str = ko.observable('-');
		this.css = {};
	}
	
	move (offset) {
		this.hex(this.rows.hexAt(this.pos + offset));
		// FIXME
		this.str('-');
	}
}
