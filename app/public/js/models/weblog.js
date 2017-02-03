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
		APP.ws.on('message', self.message.bind(self));
		return self;
	}

	clear () {
		this.logs.removeAll();
	}

	message (event) {
		console.log('aaaa', event);
		const [tag, data] = event;
		//if (tag === 'editor.webpack-log') {
			return this._log(data);
		//}
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

