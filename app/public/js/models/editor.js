'use strict';

class Editor extends Page {
	constructor () {
		super();
		this.path = '#';
	}

	static init (id = 'page-editor') {
		let self = new Editor();
		// ko.applyBindings(self, document.getElementById(id));
		self.load();
		return self;
	}

	load (path = '#', content = '') {
		const ext = path.substr(path.lastIndexOf('.') + 1);
		const config = this._configure(ext);
		const editor = this._editor();
		const session = editor.getSession();
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
		editor.focus();
	}

	click (self, e) {
		if (e.keyCode !== 999) {
			console.log(e.keyCode);
			return true;
		}
		return APP.editor.save();
	}

	save () {
		APP.entry.at(this.path).update(this._content());
		return false;
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
