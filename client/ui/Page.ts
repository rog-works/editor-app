import * as ko from 'knockout-es5';
import EventEmitter from '../event/EventEmitter';

export enum States {
	Loading,
	Syncronized,
	Modified,
	Error
}

export type Icons =  ''
	| 'fa-refresh'
	| 'fa-spin'
	| 'fa-check-circle'
	| 'fa-exclamation-circle'
	| 'fa-pencil'
	| 'fa-sitemap'
	| 'fa-table'
	| 'fa-download'
	| 'fa-folder-open'
	| 'fa-folder'
	| 'fa-plus';

export namespace Icons {
	export const Empty = '';
	export const Loading = 'fa-refresh';
	export const LoadingSpin = 'fa-spin';
	export const Modified = 'fa-check-circle';
	export const Error = 'fa-exclamation-circle';
	// page
	export const Editor = 'fa-pencil'; // XXX bad depends
	export const Entry = 'fa-sitemap';
	export const Hex = 'fa-table';
	// entry
	export const FileOpen = 'fa-download'; // XXX bad depends
	export const Directory = 'fa-folder-open';
	export const DirectoryClose = 'fa-folder';
	export const FileAdd = 'fa-plus';
}

export class Page extends EventEmitter {
	public constructor(
		tags: string[] = [],
		public display: any = { // XXX any
			active: false
		},
		public icon: any = { // XXX any
			[Icons.Loading]: false,
			[Icons.LoadingSpin]: false,
			[Icons.Modified]: false,
			[Icons.Error]: false,
			[Icons.Editor]: false,
			[Icons.Entry]: false,
			[Icons.Hex]: false
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

		case States.Error:
			this.icon[Icons.Error] = true;
			break;

		case States.Syncronized:
			this.icon[this.syncronizedIcon] = true;
			break;

		}
	}
}
