'use strict';



class Editor extends Page {
	constructor () {
		super();
		// XXX
		this.KEY_CODE_S = 83;
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
		const self = this;
		const ext = path.substr(path.lastIndexOf('.') + 1);
		const config = this._configure(ext);
		const editor = this._editor();
		const session = editor.getSession();
		self._transition(this.STATE_LOADING);
		self.path = path;
		session.setValue(content);
		session.setTabSize(config.tabs);
		session.setUseSoftTabs(config.softTabs);
		session.setMode(this._toMode(config.mode));
		self._transition(this.STATE_SYNCRONIZED);
	}
	
	resize (width, height) {
		super.resize(width, height);
		this._editor().resize();
	}
	
	focus () {
		// XXX
		APP.activate('editor');
		this._editor().focus();
	}

	keydown (e) {
		if (this.display.active()) {
			// handling ctrl + s
			if ((e.ctrlKey || e.metaKey) && e.keyCode === this.KEY_CODE_S) {
				this.save();
				return false;
			}
		}
		return true;
	}

	save () {
		const entry = APP.entry.at(this.path);
		if (entry !== null) {
			this._transition(this.STATE_LOADING);
			entry.update(
				this._content(),
				(entity) => { this._transition(this.STATE_SYNCRONIZED); },
				(err) => { this._transition(this.ICON_STATE_MODIFIED); }
			);
		}
	}

	changed () {
		if (this.state === this.STATE_SYNCRONIZED) {
			this._transition(this.STATE_MODIFIED);
		}
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
