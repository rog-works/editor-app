import * as ko from 'knockout-es5';
import EventEmitter from '../event/EventEmitter';

export enum States {
	Loading,
	Syncronized,
	Modified
}

export type Icons =  '' | 'fa-refresh' | 'fa-spin' | 'fa-pencil' | 'fa-check-circle' | 'fa-sitemap' | 'fa-download' | 'fa-folder-open' | 'fa-folder' | 'fa-plus';
export namespace Icons {
	export const Empty = '';
	export const Loading = 'fa-refresh';
	export const LoadingSpin = 'fa-spin';
	export const Modified = 'fa-check-circle';
	export const Editor = 'fa-pencil'; // XXX bad depends
	export const Entry = 'fa-sitemap'; // XXX bad depends
	export const FileOpen = 'fa-download'; // XXX bad depends
	export const Directory = 'fa-folder-open'; // XXX bad depends
	export const DirectoryClose = 'fa-folder'; // XXX bad depends
	export const FileAdd = 'fa-plus'; // XXX bad depends
}

export class Page extends EventEmitter {
	public constructor(
		tags: string[] = [],
		public display: any = { // XXX any
			active: false
		},
		public icon: any = { // XXX
			[Icons.Loading]: false,
			[Icons.LoadingSpin]: false,
			[Icons.Modified]: false,
			[Icons.Editor]: false,
			[Icons.Entry]: false
		}
	) {
		super(tags);
		ko.track(this.display);
		ko.track(this.icon);
	}

	public activate(focused: boolean): void {
		this.display.active = focused;
	}

	protected get syncronizedIcon(): Icons {
		return Icons.Editor; // FIXME
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
			this.icon[this.syncronizedIcon] = true;
		}
	}
}
