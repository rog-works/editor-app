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
		this.hex = null;
		this.dialog = null;
		this.size = {
			width: ko.observable(360),
			height: ko.observable(640)
		};
	}

	test () {
		const path = '/app/docs/schema.json';
		const entry = this.entry.at(path);
		if (entry.content.length === 0) {
			const url = '/' + encodeURIComponent(path);
			EntryItem.send((url))
				.then((entity) => {
					const schema = JSON.parse(entity.content);
					const root = 'this["0xAE426082"](a,b) || 2';//schema.$.signature._type;
					const parser = new TokenParser(new TextStream(root));
					const results = parser.execute();
					console.log('TOKEN:', results);
					const expParser = new ExpressionParser(new ArrayStream(results));
					const expression = expParser.execute();
					console.log('EXP:', expression);
				})
				.catch((error) => {
					console.error(error.message, error.stack);
				});
		}
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
			this.hex = Hex.init();
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
		this.on('shownCreate', this.shownCreateAsync);
		this.on('shownRename', this.shownRenameAsync);
		this.on('shownDelete', this.shownDeleteAsync);

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
			this.console,
			this.hex
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

	beforeReload (isText) {
		if (isText) {
			this.editor.beforeLoad();
		} else {
			this.hex.beforeLoad();
		}
	}

	afterReload (path, isText, content) {
		if (isText) {
			this.editor.load(path, content);
			this.editor.focus();
			this.focus('editor');
		} else {
			this.hex.load(path, content);
			this.hex.focus();
			this.focus('hex');
		}
		return false;
	}

	updateEntry (path, content) {
		const entry = this.entry.at(path);
		if (entry !== null) {
			entry.update(content)
				.then((updated) => {
					this.editor.saved(updated);
				})
				.catch((error) => {
					this.editor.saved(false);
				});
		}
		return false;
	}

	shownCreateAsync () {
		return this._showPromptAsync('Input create file path', '/');
	}

	shownRenameAsync (path) {
		return this._showPromptAsync('Change file path', path);
	}

	shownDeleteAsync (path) {
		return this._showConfirmAsync(`'${path}' deleted?`);
	}

	_showConfirmAsync (message) {
		return this.dialog.build().message(message).confirm();
	}

	_showPromptAsync (message, input) {
		return this.dialog.build().message(message).input(input).prompt();
	}
}

const APP = Application.init();
