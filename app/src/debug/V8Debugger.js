'use strict'

const Net = require('net');

class V8Debugger {
	constructor (port = 18089, host = 'localhost') {
		this.host = host;
		this.port = port;
		this.reqSeq = 0;
		this.reqBody = null;
		this.resolve = null;
		this.reject = null;
		this.handlers = {};
		this.client = null;
	}

	get connected () {
		return this.client !== null;
	}

	connect () {
		if (this.client === null) {
			this.client = Net.createConnection(this.port, this.host);
			this.client.on('connect', (() => { this._listen('connect'); }).bind(this));
			this.client.on('close', (() => { this._listen('close'); }).bind(this));
			this.client.on('data', this._respond.bind(this));
		} else {
			console.warn('V8Debugger', 'Already started');
		}
	}

	close () {
		if (this.client !== null) {
			this.send('disconnect')
				.then(() => {
					this.client.end();
					this.client = null;
				});
		} else {
			console.warn('V8Debugger', 'Not started');
		}
	}

	on (command, callback) {
		if (!(command in this.handlers)) {
			this.handlers[command] = [];
		}
		this.handlers[command].unshift(callback);
	}

	send (command, args = null) {
		return new Promise((resolve, reject) => {
			const seq = this.reqSeq++;
			const body = {
				seq: seq,
				type: 'request',
				command: command
			};
			// Put only when necessary
			if (args !== null) {
				body.arguments = args;
			}
			const jsonBody = JSON.stringify(body);
			const message = `Content-Length:${jsonBody.length}\r\n\r\n${jsonBody}`;
			this.reqBody = body;
			// XXX
			this.resolve = resolve;
			this.reject = reject;
			console.log('V8Debugger', 'Send', message);
			this.client.write(message, 'utf8');
		});
	}

	_respond (raw) {
		const data = raw.toString();
		console.log('V8Debugger', 'Respond', data);
		for (const res of this._parse(data)) {
			if (res.sccess === false) {
				// XXX expected throw error
				console.error('V8Debugger', 'Failed request', res);
				continue;
			}
			if (res.type === 'response') {
				if (this.reqBody.command !== res.command) {
					throw new Error(`Unexpected command. req = ${this.reqBody.command}, res = ${res.command}`);
				}
				// XXX
				this.resolve(res.body);
			} else if (res.type === 'event') {
				this._listen(res.event, res.body);
			} else {
				console.warn('V8Debugger', 'Unknown response type', res);
			}
		}
	}

	_parse (data) {
		const blocks = data.split('\r\n\r\n');
		const bodies = [];
		let nextHeader = '';
		for(let seq = 0; blocks.length > 0; seq += 1) {
			let header = '';
			let body = '';
			if (seq === 0) {
				header = blocks.shift();
				body = blocks.shift();
			} else {
				header = nextHeader;
				body = blocks.shift();
			}
			// XXX socket response to but '{json}header\r\n{json}...'
			if (blocks.length > 0) {
				const matches = body.match(/^(.+})([^},].+)$/);
				body = matches[1];
				nextHeader = matches[2];
			}
			const res = this._parseOne(header, body);
			if (res !== null) {
				bodies.push(res);
			}
		}
		return bodies;
	}

	_parseOne (header, body) {
		const filtered = header.split('\r\n').filter((line) => {
			return line.startsWith('Content-Length: ');
		}).map((line) => {
			return line.match(/Content-Length: ([\d]+)$/)[1];
		});
		const length = filtered ? filtered[0] : 0;
		try {
			return length > 0 ? JSON.parse(body) : null;
		} catch (error) {
			console.error('V8Debugger', 'Failed parse response body', error, body);
			return '';
		}
	}

	_error (error) {
		console.error(error);
	}

	_listen (tag, ...args) {
		console.log('V8Debugger', `Listening on ${tag}`, this.host, this.port);
		if (tag in this.handlers) {
			for (const handler of this.handlers[tag]) {
				if (!handler(...args)) {
					break;
				}
			}
		}
	}
}

module.exports = V8Debugger;
