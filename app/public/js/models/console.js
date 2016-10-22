'use strict';

class Console extends Page {
	constructor () {
		super();
		this.logs = ko.observableArray([]);
		this.logger = new Logger(this);
	}

	static init (id = 'page-console') {
		const self = new Console();
		// ko.applyBindings(self, document.getElementById(id));
		self._bind();
		return self;
	}

	clear () {
		this.logs.removeAll();
	}

	_bind () {
		const _log = console.log;
		const _warn = console.warn;
		const _error = console.error;
		const self = this;
		console.log = (...args) => {
			_log.apply(console, args);
			self._log('LOG', ...args);
		};
		console.warn = (...args) => {
			_warn.apply(console, args);
			self._log('WRN', ...args);
		};
		console.error = (...args) => {
			_error.apply(console, args);
			self._log('ERR', ...args);
		};
	}

	_log (tag, ...args) {
		args.unshift(tag);
		this.logger.line(args.map((arg) => {
			if (Array.isArray(arg) || typeof arg === 'object') {
				return JSON.stringify(arg);
			} else {
				return arg;
			}
		}).join(' '));
	}
	
	coloring (line) {
		if (/^ERR/.test(line)) {
			return 'bc1-e';
		} else if (/^WRN/.test(line)) {
			return 'bc1-w';
		} else {
			return 'fc1';
		}
	}
}
