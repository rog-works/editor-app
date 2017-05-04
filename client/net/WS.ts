import EventEmitter from '../event/EventEmitter';

export type WSEvents = 'message' | 'open' | 'close';
export namespace WSEvents {
	export const Message = 'message';
	export const Open = 'open';
	export const Close = 'close';
}

export default class WS extends EventEmitter {
	public readonly url: string;
	private _ws: WebSocket;

	public constructor(url: string) {
		super([WSEvents.Message, WSEvents.Open, WSEvents.Close]);
		this.url = url;
		this._ws = this.connect(this.url);
	}

	public connect(url: string): WebSocket {
		try {
			const ws = new WebSocket(url);
			ws.onmessage = this._onMessage.bind(this);
			ws.onopen = this._onOpen.bind(this);
			ws.onclose = this._onClose.bind(this);
			return ws;
		} catch (err) {
			console.error(err);
			throw new Error(err);
		}
	}

	public send(data: any): void {
		this._ws.send(JSON.stringify(data));
	}

	private _retry(): void {
		try {
			this._ws = this.connect(this.url);
		} catch (err) {
			setTimeout(this._retry.bind(this), 1000);
		}
	}

	private _onMessage(message: MessageEvent): boolean {
		this.emit(WSEvents.Message, this, JSON.parse(message.data));
		return true;
	}

	private _onOpen(): boolean {
		console.log('On WS open');
		this.emit(WSEvents.Open, this);
		return true;
	}

	private _onClose(): boolean {
		console.log('On WS close');
		this.emit(WSEvents.Close, this);
		this._retry();
		return true;
	}
}
