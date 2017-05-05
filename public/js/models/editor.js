'use strict';

class Editor extends Page {
	constructor () {
		super();
		this.KEY_CODE_S = 83;
		this.KEY_CODE_F9 = 120;
		this.KEY_CODE_INVALIDS = [82, 87]; // R and W
		this.STATE_SYNCRONIZED = 'syncronized';
		this.STATE_MODIFIED = 'modified';
		this.ICON_STATE_SYNCRONIZED = 'fa-pencil';
		this.ICON_STATE_MODIFIED = 'fa-check-circle';

		this.path = '#';
		this.state = this.STATE_SYNCRONIZED;
		this.icon[this.ICON_STATE_SYNCRONIZED] = ko.observable(true);
		this.icon[this.ICON_STATE_MODIFIED] = ko.observable(false);
	}

	static init (id = 'page-editor') {
		const self = new Editor();
		// ko.applyBindings(self, document.getElementById(id));
		self.load();
		self._editor().on('change', () => { self.changed(); });
		return self;
	}

	load (path = '#', content = '') {
		const ext = path.substr(path.lastIndexOf('.') + 1);
		const config = this._configure(ext);
		const editor = this._editor();
		const session = editor.getSession();
		this._transition(this.STATE_LOADING);
		this.path = path;
		session.setValue(content);
		session.setTabSize(config.tabs);
		session.setUseSoftTabs(config.softTabs);
		session.setMode(this._toMode(config.mode));
		this._transition(this.STATE_SYNCRONIZED);
	}
	
	resize (width, height) {
		super.resize(width, height);
		this._editor().resize();
	}
	
	focus () {
		this._editor().focus();
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
		this.fire('updateEntry', this.path, this._content());
	}

	saved (updated) {
		this._transition(updated ? this.STATE_SYNCRONIZED : this.STATE_MODIFIED);
	}

	changed () {
		if (this.state === this.STATE_SYNCRONIZED) {
			this._transition(this.STATE_MODIFIED);
		}
	}
	
	cursor (key) {
		switch (key) {
		case 'left':
			this._editor().navigateLeft(1);
			break;
		case 'right':
			this._editor().navigateRight(1);
			break;
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

	_content () {
		return this._editor().getSession().getValue();
	}

	_configure (ext) {
		const config = {
			sh: {mode: 'sh', tabs: 4, softTabs: false},
			py: {mode: 'python', tabs: 4, softTabs: false},
			php: {mode: 'php', tabs: 4, softTabs: false},
			css: {mode: 'css', tabs: 4, softTabs: false},
			html: {mode: 'html', tabs: 4, softTabs: false},
			json: {mode: 'json', tabs: 4, softTabs: false},
			js: {mode: 'javascript', tabs: 4, softTabs: false},
			ts: {mode: 'typescript', tabs: 4, softTabs: false},
			rb: {mode: 'ruby', tabs: 2, softTabs: true},
			yml: {mode: 'yaml', tabs: 2, softTabs: true},
			yaml: {mode: 'yaml', tabs: 2, softTabs: true}
		};
		return (ext in config) ? config[ext] : config.sh;
	}

	_editor () {
		return ace.edit('editor');
	}

	_toMode (mode) {
		return `ace/mode/${mode}`;
	}
}
