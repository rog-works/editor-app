'use strict';

class Application {
	constructor () {
		this.ws = null;
		this.tool = null;
		this.console = null;
		this.editor = null;
		this.entry = null;
		this.shell = null;
		this.weblog = null;
		this.size = ko.observable({ width: 360, height: 640 });
	}

	static init () {
		const self = new Application();
		window.onload = () => { self.load(); };
		return self;
	}

	load(id = 'main') {
		try {
			console.log('On load started');
			this.ws = new WS();
			this.tool = Tool.init();
			this.console = Console.init();
			this.editor = Editor.init();
			this.entry = Entry.init();
			this.shell = Shell.init();
			this.weblog = Weblog.init();
			ko.applyBindings(this, document.getElementById(id));
			this._after();
			console.log('On load finished');
		} catch (error) {
			console.error(error.message, error.stack);
		}
	}
	
	_after () {
		const self = this;
		this.resize();
		// XXX handling for window event
		window.onresize = (e) => { return self.resize(e); };
		document.onkeydown = (e) => { return self.keydown(e); };
	}

	test () {
		try {
			console.log('resize scale');
			const viewport = document.getElementsByName('viewport')[0];
			viewport.setAttribute('content', `width=device-width, initial-scale=1.0`);
		} catch (error) {
			console.error(error.message, error.stack);
		}
	}

	resize (e) {
		const w = window.innerWidth;
		const h = window.innerHeight;
		this.size({ width: w, height: h });
		[
			this.editor,
			this.entry,
			this.shell,
			this.weblog,
			this.console
		].forEach((page) => {
			page.resize(w - 32, h);
		});
		console.log('On resize', w, h);
		return true;
	}

	keydown (e) {
		return this.editor.keydown(e);
	}
}

const APP = Application.init();
