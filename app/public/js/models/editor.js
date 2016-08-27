'use strict';

const KEY_CODE_S = 83;

class Editor extends Page {
	constructor () {
		super();
		this.path = '#';
		this.icon['fa-pencil'] = ko.observable(true);
		this.icon['fa-code-fork'] = ko.observable(false);
	}

	static init (id = 'page-editor') {
		let self = new Editor();
		// ko.applyBindings(self, document.getElementById(id));
		self.load();
		return self;
	}

	load (path = '#', content = '') {
		const self = this;
		const ext = path.substr(path.lastIndexOf('.') + 1);
		const config = this._configure(ext);
		const editor = this._editor();
		const session = editor.getSession();
		editor.on('change', () => { self.changed(); });
		session.setValue(content);
		session.setTabSize(config.tabs);
		session.setUseSoftTabs(config.softTabs);
		session.setMode(this._toMode(config.mode));
		this.path = path;
	}
	
	resize (width, height) {
		super.resize(width, height);
		this._editor().resize();
	}
	
	focus () {
		// XXX
		APP.tool.activate('editor');
		this._editor().focus();
	}

	keydown (e) {
		// XXX depands on tool...
		if (APP.tool.page() === 'editor') {
			// handling ctrl + s
			if ((e.ctrlKey || e.metaKey) && e.keyCode === KEY_CODE_S) {
				this.save();
				return false;
			}
		}
		return true;
	}

	save () {
		const entry = APP.entry.at(this.path);
		if (entry !== null) {
			this.icon['fa-pencil'](false);
			this.icon['fa-reflesh'](true);
			this.icon['fa-spin'](true);
			entry.update(this._content(), (entity) => {
				this.icon['fa-pencil'](true);
				this.icon['fa-reflesh'](false);
				this.icon['fa-spin'](false);
			});
		}
	}

	changed () {
		if (this.icon['fa-pencil']()) {
			this.icon['fa-pencil'](false);
			this.icon['fa-code-fork'](true);
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
