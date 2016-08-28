'use strict';

const RETRY_MAX = 5;

class WS {
	constructor (uri = 'ws://localhost:18082') {
		const self = this;
		this.uri = uri;
		this.handlers = {
			message: [],
			open: [],
			close: []
		};
		this.on('close', () => { return self._retry(); });
		this.socket = WS.connect(this);
	}
	
	static connect (self) {
		try {
			const socket = new WebSocket(self.uri);
			socket.onmessage = (msg) => { self._onMessage(msg); };
			socket.onopen = () => { self._onOpen(); };
			socket.onclose = () => { self._onClose(); };
			console.log('Connected WS.', self.uri);
			return socket;
		} catch (error) {
			console.error(error.message, error.stack);
			return null;
		}
	}

	_retry () {
		for (let count = 0; count < RETRY_MAX; count += 1) {
			const socket = WS.connect(this);
			if (socket !== null) {
				this.socket = socket;
				return false;
			}
		}
		console.error('Disconnected WS.', this.uri);
		return true;
	}

	on (tag, handler) {
		if (tag in this.handlers) {
			this.handlers[tag].unshift(handler);
		}
	}

	listen (tag, ...args) {
		console.log('On WS', tag, args);
		for (const handler of this.handlers[tag]) {
			if (!handler(...args)) {
				break;
			}
		}
	}

	_onMessage (msg) {
		// XXX via fluent-plugin-websocket
		this.listen('message', JSON.parse(msg.data));
	}

	_onOpen () {
		this.listen('open', this.uri);
	}

	_onClose () {
		this.listen('close', this.uri);
	}
}
