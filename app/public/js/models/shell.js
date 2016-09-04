'use strict';

class Shell extends Page {
	constructor () {
		super();
		this.KEY_CODE_ENTER = 13;
		this.KEY_CODE_L_UPPER = 76;

		this.dir = ko.observable('/');
		this.query = ko.observable('');
		this.css = ko.observable('');
		this.history = ko.observableArray([]);
		this.logs = ko.observableArray([]);
		this.logger = new Logger(this);
	}

	static init (id = 'page-shell') {
		const self = new Shell();
		// ko.applyBindings(self, document.getElementById(id));
		return self;
	}

	static send (path, exData = {}) {
		return new Promise((resolve, reject = null) => {
			const url = `/shell${path}`;
			const base = {
				url: url,
				type: 'POST',
				dataType: 'json',
				timeout: 1000,
				success: (res) => {
					console.log('Respond', data.type, data.url);
					resolve(res);
				},
				error: (res, err) => {
					console.error('Failed request', data.type, data.url, err, res.status, res.statusText, res.responseText);
					if (reject !== null) {
						reject(err);
					}
				}
			};
			const data = $.extend(base, exData);
			console.log('Request', data.type, data.url);
			$.ajax(data);
		});
	}

	clear () {
		this.logs.removeAll();
	}

	keyup (self, e) {
		if (e.keyCode === this.KEY_CODE_ENTER) {
			this._exec();
			return false;
		} else if (e.keyCode === this.KEY_CODE_L_UPPER) {
			if (e.ctrlKey && e.shiftKey) {
				this.clear();
				return false;
			}
		}
		return true;
	}

	_parse (query) {
		let dir = this.dir();
		const matches = query.match(/^cd ([\d\w\-\/_.~]+);?(.*)$/);
		if (matches) {
			if (matches.length > 1) {
				if (matches[1].indexOf('~') === 0) {
					dir = '/' + matches[1].substr(1);
				} else {
					dir = dir + '/' + matches[1];
				}
				// XXX
				dir = dir.replace('//', '/');
			}
			if (matches.length > 2) {
				query = matches[2].trim();
			}
		}
		return [dir, query];
	}

	_exec () {
		const orgQuery = this.query();
		const [dir, query] = this._parse(orgQuery);
		if (query.length === 0) {
			if (this.dir() !== dir) {
				this.dir(dir);
				this.query('');
				this.logger.line(`$ ${orgQuery}`);
			}
			return true;
		}
		this.dir(dir);
		this.query('');
		this.logger.line(`$ ${orgQuery}`);
		const url = '?dir=' + encodeURIComponent(this.dir());
		Shell.send(url, {data: {query: query}})
			.then((res) => {
				if (this.history.indexOf(orgQuery) === -1) {
					this.history.push(orgQuery);
				}
			});
		return false;
	}

	message ([tag, data]) {
		if (tag === 'editor.shell-log') {
			return this.logger.put(data.message);
		}
		return true;
	}

	coloring (line) {
		if (/^\tmodified:/.test(line) ||
			/^\tnew file:/.test(line) ||
			/^\+/.test(line)) {
			return 'fc1-p';
		} else if (/^\tdeleted:/.test(line) ||
					/^\-/.test(line)) {
			return 'fc1-e';
		} else {
			return 'fc1';
		}
	}
}
