'use strict';

const KEY_CODE_ENTER = 13;

class Shell extends Log {
	constructor () {
		super();
		this.dir = ko.observable('/');
		this.query = ko.observable('');
		this.css = ko.observable('');
		this.history = ko.observableArray([]);
	}

	static init (id = 'page-shell') {
		const self = new Shell();
		// XXX depends on APP...
		APP.ws.on('message', (msg) => { return self._onMessage(msg); });
		// ko.applyBindings(self, document.getElementById(id));
		return self;
	}
	
	static send (path, data, callback) {
		const url = `/shell${path}`;
		let _data = {
			url: url,
			type: 'POST',
			dataType: 'json',
			timeout: 1000,
			success: (res) => {
				console.log('respond', url);
				callback(res);
			},
			error: (res, err) => {
				console.error(err, res.status, res.statusText, res.responseText);
			}
		};
		console.log('request', url, data);
		$.ajax($.extend(_data, data));
	}

	click (self, e) {
		if (e.keyCode !== KEY_CODE_ENTER) {
			return true;
		}
		// XXX
		return APP.shell._exec();
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
		const [dir, query] = this._parse(this.query());
		if (query.length === 0) {
			if (this.dir() !== dir) {
				this.dir(dir);
				this.query('');
				this.line(`$ ${this.query()}`);
			}
			return true;
		}
		this.dir(dir);
		this.query('');
		this.line(`$ ${query}`);
		const url = '?dir=' + encodeURIComponent(this.dir());
		Shell.send(url, {data: {query: query}}, (res) => {
			if (this.history.indexOf(query) === -1) {
				this.history.push(query);
			}
		});
		return false;
	}

	_onMessage ([tag, data]) {
		if (tag === 'editor.shell-log') {
			return this.put(data.message);
		}
		return true;
	}

	coloring (log) {
		if (/^\tmodified:/.test(log) ||
			/^\tnew file:/.test(log) ||
			/^\+/.test(log)) {
			return 'fc1-p';
		} else if (/^\tdeleted:/.test(log) ||
					/^\-/.test(log)) {
			return 'fc1-e';
		} else {
			return super.coloring(log);
		}
	}
}
