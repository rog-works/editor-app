import EventEmitter from '../event/EventEmitter';

// deprecated
export default class Node extends EventEmitter {
	public constructor(
		private _parent: Node | null
	) {
		super([]);
	}

	public addNode(node: Node): void {
		node._parent = this;
	}

	public addNodes(nodes: Node[]): void {
		for (const node of nodes) {
			node._parent = this;
		}
	}

	public fire(tag: string, ...args: any[]): void {
		if (this._parent !== null) {
			this._parent._bubble(tag, ...args);
		}
	}

	private _bubble(tag: string, ...args: any[]): void {
		if (this.emit(tag, this, args)) {
			return;
		}
		if (this._parent !== null) {
			this._parent._bubble(tag, ...args);
		}
	}
}
