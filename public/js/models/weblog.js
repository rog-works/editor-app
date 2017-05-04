'use strict';

class Weblog extends Page {
	constructor () {
		super();
		this.logs = ko.observableArray([]);
		this.logger = new Logger(this);
	}

	static init (id = 'page-weblog') {
		const self = new Weblog();
		// ko.applyBindings(self, document.getElementById(id));
		return self;
	}

	clear () {
		this.logs.removeAll();
	}

	message (event) {
		const [tag, data] = event;
		// if (tag === 'editor.access-log') {
		if (tag === 'editor.webpack-log') {
			return this._log(data);
		}
		return true;
	}

	_log (msg) {
		return this.logger.line(this._parseLine(msg));
	}

	_parseLine (msg) {
		let line = '';
		let delimiter = '';
		for (let key in msg) {
			line += delimiter + msg[key];
			delimiter = ' ';
		}
		return this._colorize(line);
	}
	
	_colorize (line) {
		line = line.replace(/\s?\/nodered-webpack\s?/, '');
		line = line.replace(/\s?\/editor-webpack\s?/, '');
		line = line.replace(/\s?stdout\s?/, '');
		line = line.replace(/[\w\d]{64}/, '');
		line = line.split('[31m').join('<span style="color:#f00">');
		line = line.split('[32m').join('<span style="color:#0f0">');
		line = line.split('[33m').join('<span style="color:#ff0">');
		line = line.split('[1m').join('<span style="font-weight:bold">');
		line = line.split('[22m').join('</span>');
		line = line.split('[39m').join('</span>');
		return line;
	}
}

