export interface EventHandler {
	(sender: any, event?: any): boolean
}

interface EventHandlers {
	[tag: string]: EventHandler[]
}

export default class EventEmitter {
	private readonly _handlers: EventHandlers

	public constructor(tags: string[]) {
		this._handlers = {};
		for (const tag of tags) {
			this._handlers[tag] = [];
		}
	}

	public on(tag: string, callback: EventHandler): this {
		if (this._handlers[tag].indexOf(callback) === -1) {
			this._handlers[tag].unshift(callback);
		}
		return this;
	}

	public off(tag: string, callback: EventHandler): this {
		const index = this._handlers[tag].indexOf(callback);
		if (index !== -1) {
			this._handlers[tag].splice(index, 1);
		}
		return this;
	}

	public emit(tag: string, sender: any, event: any = undefined): boolean {
		for (const handler of this._handlers[tag]) {
			if (!handler(sender, event)) {
				return true;
			}
		}
		return false;
	}
}
