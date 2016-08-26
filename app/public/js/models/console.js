'use strict';

class Console extends Log {
	constructor () {
		super();
	}

	static init (id = 'page-console') {
		const self = new Console();
		// ko.applyBindings(self, document.getElementById(id));
		self.bind();
		return self;
	}

	bind () {
		const _log = console.log;
		const _warn = console.warn;
		const _error = console.error;
		const self = this;
		console.log = (...args) => {
			_log.apply(console, args);
			self.on('LOG', ...args);
		};
		console.warn = (...args) => {
			_warn.apply(console, args);
			self.on('WRN', ...args);
		};
		console.error = (...args) => {
			_error.apply(console, args);
			self.on('ERR', ...args);
		};
	}

	on (tag, ...args) {
		args.unshift(tag);
		this.line(args.join(' '));
	}
	
	coloring (log) {
		if (/^ERR/.test(log)) {
			return 'bc1-e';
		} else if (/^WRN/.test(log)) {
			return 'bc1-w';
		} else {
			return super.coloring(log);
		}
	}
}
