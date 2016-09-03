'use strict';

class Application extends Node {
	constructor () {
		super();
		this.ws = null;
		this.console = null;
		this.editor = null;
		this.entry = null;
		this.shell = null;
		this.weblog = null;
		this.dialog = null;
		this.size = {
			width: ko.observable(360),
			height: ko.observable(640)
		};
	}

	static init () {
		const self = new Application();
		window.onload = () => { self._load(); };
		return self;
	}

	_load(id = 'main') {
		try {
			console.log('On load started');
			this._before();
			this.ws = new WS();
			this.console = Console.init();
			this.editor = Editor.init();
			this.entry = Entry.init();
			this.shell = Shell.init();
			this.weblog = Weblog.init();
			this.dialog = Dialog.init();
			ko.applyBindings(this, document.getElementById(id));
			this._after();
			console.log('On load finished');
		} catch (error) {
			console.error(error.message, error.stack);
		}
	}

	_before () {
		// extend ko
		KoPlugin.bind();
	}

	_after () {
		// bind events
		this.on('updateEntry', this.updateEntry);
		this.on('beforeReload', this.beforeReload);
		this.on('afterReload', this.afterReload);
		this.on('shownCreate', this.shownCreate);
		this.on('shownRename', this.shownRename);
		this.on('shownDelete', this.shownDelete);

		// bind pages
		for (const page of this._pages()) {
			this.addNode(page);
		}

		// first view on entry
		this.focus('entry');

		// force resize
		this.resize();
	}

	_pages () {
		return [
			this.entry,
			this.editor,
			this.shell,
			this.weblog,
			this.console
		];
	}

	resize (self, e) {
		const w = window.innerWidth;
		const h = window.innerHeight;
		this.size.width(w)
		this.size.height(h);
		for(const page of this._pages()) {
			page.resize(w - 32, h);
		}
		this.dialog.resize(w, h);
		console.log('On resize', w, h);
		return true;
	}

	focus (pageName) {
		for(const page of this._pages()) {
			if (page.display.active()) {
				page.activate(false);
				break;
			}
		}
		if (pageName in this) {
			this[pageName].activate(true);
		}
		return false;
	}

	beforeReload (path) {
		this.editor.beforeLoad(path);
	}

	afterReload (path, content) {
		this.editor.load(path, content);
		this.editor.focus();
		this.focus('editor');
		return false;
	}

	updateEntry (path, content, callback) {
		this.entry.update(path, content, callback);
		return false;
	}

	shownCreate (callback) {
		this._showPrompt('Input create file path', '/', callback);
		return false;
	}

	shownRename (path, callback) {
		this._showPrompt('Change file path', path, callback);
		return false;
	}

	shownDelete (path, callback) {
		this._showConfirm(`'${path}' deleted?`, callback);
		return false;
	}

	_showConfirm (message, callback) {
		this.dialog.build().message(message).on(callback).confirm();
	}

	_showPrompt (message, input, callback) {
		this.dialog.build().message(message).input(input).on(callback).prompt();
	}
}

const APP = Application.init();
