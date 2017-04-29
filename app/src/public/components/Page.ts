import * as ko from 'knockout-es5';
import Node from './Node';

export type States = 'loading';
export namespace States {
	export const Loading = 'loading';
}

export default class Page extends Node {
	public constructor(
		_parent: Node | null = null, // XXX implicit accesser ?!
		public display: any = { // XXX any
			active: false
		},
		public icon: any = { // XXX
			'fa-refresh': false,
			'fa-spin': false
		}
	) {
		super(_parent);
		ko.track(this.display);
		ko.track(this.icon);
	}

	public activate(focused: boolean): void {
		this.display.active(focused);
	}

	protected _transition(state: States): void {
		for (const key in this.icon) {
			this.icon[key](false);
		}
		if (state === States.Loading) {
			this.icon['fa-refresh'](true);
			this.icon['fa-spin'](true);
		}
	}
}
