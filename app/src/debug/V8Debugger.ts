import * as Net from 'net';

export default class V8Debugger {
	public constructor(
		private _host: string = 'localhost',
		private _port: number = 18089,
		private _reqSeq: number = 0,
		private _reqBody: any = null,
		private _resolve: Function | null = null,
		private _reject: Function | null = null,
		private _handlers: any = {},
		private _client: Net.Socket | null = null
	) {}

	public get connected(): boolean {
		return this._client !== null;
	}

	public connect(): void {
		if (this._client === null) {
			this._client = Net.createConnection(this._port, this._host);
			this._client.on('connect', (() => { this._listen('connect'); }).bind(this));
			this._client.on('close', (() => { this._listen('close'); }).bind(this));
			this._client.on('data', this._respond.bind(this));
		} else {
			console.warn('V8Debugger', 'Already started');
		}
	}

	public async close(): Promise<void> {
		if (this._client !== null) {
			await this.send('disconnect');
			this._client.end();
			this._client = null;
		} else {
			console.warn('V8Debugger', 'Not started');
		}
	}

	public on(command: string, callback: Function): void {
		if (!(command in this._handlers)) {
			this._handlers[command] = [];
		}
		this._handlers[command].unshift(callback);
	}

	public send(command: string, args: any = null): Promise<any> {
		return new Promise((resolve: Function, reject: Function) => {
			const seq = this._reqSeq++;
			const body: any = {
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
			this._reqBody = body;
			// XXX
			this._resolve = resolve;
			this._reject = reject;
			console.log('V8Debugger', 'Send', message);
			if (this._client) { // XXX nullable
				this._client.write(message, 'utf8');
			}
		});
	}

	_respond (raw: Buffer): void {
		const data = raw.toString();
		console.log('V8Debugger', 'Respond', data);
		for (const res of this._parse(data)) {
			if (res.sccess === false) {
				// XXX expected throw error
				console.error('V8Debugger', 'Failed request', res);
				continue;
			}
			if (res.type === 'response') {
				if (this._reqBody.command !== res.command) {
					throw new Error(`Unexpected command. req = ${this._reqBody.command}, res = ${res.command}`);
				}
				// XXX
				if (this._resolve) { // XXX nullable
					this._resolve(res.body);
				}
			} else if (res.type === 'event') {
				this._listen(res.event, res.body);
			} else {
				console.warn('V8Debugger', 'Unknown response type', res);
			}
		}
	}

	_parse (data: any): any {
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
				if (matches && matches.length > 2) {
					body = matches[1];
					nextHeader = matches[2];
				} else {
					console.error('V8Debugger', 'Unmatch body format');
				}
			}
			const res = this._parseOne(header, body);
			if (res !== null) {
				bodies.push(res);
			}
		}
		return bodies;
	}

	private _parseOne(header: string, body: string): string | null {
		const filtered = header.split('\r\n')
			.filter(line => line.startsWith('Content-Length: '))
			.map((line) => {
				const matches = line.match(/Content-Length: ([\d]+)$/);
				return matches && matches.length > 1 ? parseInt(matches[1]) : 0;
			});
		const length = filtered ? filtered[0] : 0;
		try {
			return length > 0 ? JSON.parse(body) : null;
		} catch (error) {
			console.error('V8Debugger', 'Failed parse response body', error, body);
			return '';
		}
	}

	private _error(error: any): void {
		console.error(error);
	}

	private _listen(tag: string, ...args: any[]): void {
		console.log('V8Debugger', `Listening on ${tag}`, this._host, this._port);
		if (tag in this._handlers) {
			for (const handler of this._handlers[tag]) {
				if (!handler(...args)) {
					break;
				}
			}
		}
	}
}
