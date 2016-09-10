'use strict'

const Net = require('net');

class Debugger {
	constructor (port = 18089, host = 'localhost') {
		const self = this;
		this.host = host;
		this.port = port;
		this.reqSeq = 0;
		this.reqBodies = {};
		this.handlers = {};
		this.client = null;
	}

	get connected () {
		return this.client !== null;
	}

	connect () {
		if (this.client === null) {
			const self = this;
			this.client = Net.connect(this.port, this.host);
			this.client.on('connect', () => { self._listen('connect'); });
			this.client.on('close', () => { self._listen('close'); });
			this.client.on('data', (data) => { this._respond(data); });
		} else {
			console.warn('Debug already started');
		}
	}

	close () {
		if (this.client !== null) {
			this.client.end();
			this.client = null;
		} else {
			console.warn('Debug not started');
		}
	}

	on (command, callback) {
		if (!(command in this.handlers)) {
			this.handlers[command] = [];
		}
		this.handlers[command].unshift(callback);
	}

	send (command, args = {}) {
		const seq = this.reqSeq++;
		const body = {
			seq: seq,
			type: 'request',
			command: command,
			arguments: args
		};
		this.reqBodies[seq] = body;
		const bodyS = JSON.stringify(body);
		const message = `Content-Length:${bodyS.length}\r\n\r\n${bodyS}`;
		console.log('Debug send', body, message);
		this.client.write(message);
	}

	_respond (dataBin) {
		const data = dataBin.toString();
		console.log('Debug respond', data);
		this._parse(data).forEach((res) => {
			if (!res.sccess) {
				console.warn('Debug failed request', res);
				return;
			}
			if (res.type === 'response') {
				if (!(res.request_seq in this.reqBodies)) {
					throw new Error('Unknown request', res);
				}
				const reqBody = this.reqBodies[res.seq];
				delete this.reqBodis[res.seq];
				this._listen(reqBody.command, res.body);
			} else if (res.type === 'event') {
				this._listen(res.event, res.body);
			} else {
				console.warn('Unknown response type', res);
			}
		});
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
			// XXX socket response to but '{json}header\r\n'
			if (blocks.length > 0) {
				const matches = body.match(/^(.+})([^},].+)$/);
				body = matches[1];
				nextHeader = matches[2];
			}
			const res = this._parseOne(header, body);
			if (res.length > 0) {
				bodies.push(res);
			}
		}
		return bodies;
	}

	_parseOne (header, body) {
		const filtered = header.split('\r\n').filter((self) => {
			return self.startsWith('Content-Length: ');
		}).map((self) => {
			return self.match(/Content-Length: ([\d]+)$/)[1];
		});
		const length = filtered ? filtered[0] : 0;
		try {
			return length > 0 ? JSON.parse(body) : '';
		} catch (error) {
			console.error('Debug failed parse response body', error, body);
			return '';
		}
	}

	_error (error) {
		console.error(error);
	}

	_listen (tag, ...args) {
		console.log(`Debug listening on ${tag}`, this.host, this.port);
		if (tag in this.handlers) {
			for (const handler of this.handlers[tag]) {
				if (!handler(...args)) {
					break;
				}
			}
		}
	}
}

module.exports = Debugger;
