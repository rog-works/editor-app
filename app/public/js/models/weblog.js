'use strict';

class Weblog extends Log {
	constructor () {
		super();
		this.socket = null;
	}

	static init (id = 'page-weblog') {
		const self = new Weblog();
		// XXX depends on APP...
		APP.ws.on('message', (msg) => { return self._onMessage(msg); });
		// ko.applyBindings(self, document.getElementById(id));
		return self;
	}

	_log (msg) {
		return this.line(this._parseLine(msg));
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

	_onMessage ([tag, data]) {
		if (tag === 'editor.access-log') {
			return this._log(data);
		}
		return true;
	}
}

