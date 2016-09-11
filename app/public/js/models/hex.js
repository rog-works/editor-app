'use strict';

class Hex extends Page {
	constructor () {
		super();
		this.KEY_CODE_S = 83;
		this.KEY_CODE_INVALIDS = [82, 87]; // R and W
		this.STATE_SYNCRONIZED = 'syncronized';
		this.STATE_MODIFIED = 'modified';
		this.ICON_STATE_SYNCRONIZED = 'fa-pencil';
		this.ICON_STATE_MODIFIED = 'fa-check-circle';

		this.path = '#';
		this.content = '';
		this.offset = 0;
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

	rows () {
		return new HexRow();
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
