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
		return line;
	}
}

