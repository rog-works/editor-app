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
	
	_after () {
		const self = this;
		self.on('reload', self.reload);
		self.on('focus', self.focus);
		self.on('prompt', self.prompt);
		self.on('confirm', self.confirm);
		for (const page of self._pages()) {
			self.addNode(page);
		}
		self.focus('entry');
		self._resize();
		// XXX handling for window event
		window.onresize = (e) => { return self._resize(e); };
		document.onkeydown = (e) => { return self._keydown(e); };
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

	_resize (e) {
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

	_keydown (e) {
		return this.editor.keydown(e);
	}

	focus (pageName) {
		for(const page of this._pages()) {
			if (page.display.active()) {
				page.selected(false);
				break;
			}
		}
		if (pageName in this) {
			this[pageName].selected(true);
		}
		return false;
	}

	reload (path, content) {
		this.editor.load(path, content);
		this.editor.focus();
		return false;
	}

	confirm (message, callback) {
		this.dialog.build().message(message).on(callback).confirm();
		return false;
	}

	prompt (message, input, callback) {
		this.dialog.build().message(message).input(input).on(callback).prompt();
		return false;
	}
}

const APP = Application.init();
