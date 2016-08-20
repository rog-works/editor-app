'use strict';

const KEY_CODE_ENTER = 13;

class Shell extends Log {
	constructor () {
		super();
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
 
	_exec () {
		const query = this.query();
		if (query.length === 0) {
			return true;
		}
		this.query('');
		this.line(`$ ${query}`);
		Shell.send('', {data: {query: query}}, (res) => {
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
		if (/^\tmodified:/.test(log)) {
			return '#080';
		} else if (/^\+\t:/.test(log)) {
			return '#080';
		} else if (/^\-\t:/.test(log)) {
			return '#800';
		} else {
			return super.coloring(log);
		}
	}
}
