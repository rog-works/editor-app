import * as ko from 'knockout-es5';
import Node from './Node';

export enum States {
	Loading,
	Syncronized, // XXX global?
	Modified
}

type Icons = 'fa-refresh' | 'fa-spin' | 'fa-pencil' | 'fa-check-circle';
namespace Icons {
	export const Loading = 'fa-refresh';
	export const LoadingSpin = 'fa-spin';
	export const Syncronized = 'fa-pencil'; // FIXME
	export const Modified = 'fa-check-circle';
}

export default class Page extends Node {
	public constructor(
		_parent: Node | null = null, // XXX implicit accesser ?!
		public display: any = { // XXX any
			active: false
		},
		public icon: any = { // XXX
			[Icons.Loading]: false,
			[Icons.LoadingSpin]: false,
			[Icons.Syncronized]: false,
			[Icons.Modified]: false
		}
	) {
		super(_parent);
		ko.track(this.display);
		ko.track(this.icon);
	}

	public activate(focused: boolean): void {
		this.display.active = focused;
	}

	protected _transition(state: States): void {
		for (const key in this.icon) {
			this.icon[key] = false;
		}

		switch (state) {
		case States.Loading:
			this.icon[Icons.Loading] = true;
			this.icon[Icons.LoadingSpin] = true;
			break;

		case States.Modified:
			this.icon[Icons.Modified] = true;
			break;

		case States.Syncronized:
			this.icon[Icons.Syncronized] = true;
		}
	}
}
