import * as ko from 'knockout-es5';
import EventEmitter from '../event/EventEmitter';
import {Page, States, Icons} from '../ui/Page';
import Http from '../net/Http';
import Path from '../io/Path';

interface EntryEntity {
	path: string;
	isFile: boolean;
	isText: boolean;
	content: string; // | Buffer FIXME
}

enum EntryTypes { // XXX type???
	File,
	FileOpen,
	Directory,
	DirectoryClose,
	FileAdd // XXX
}

export type EntryEvents = 'created' | 'updated' | 'deleted' | 'renamed' | 'beforeReload' | 'afterReload' | 'deactivate' | 'expand';
export namespace EntryEvents {
	export const Created = 'created';
	export const Updated = 'updated';
	export const Deleted = 'deleted';
	export const Renamed = 'renamed';
	export const BeforeLoaded = 'beforeReloaded';
	export const AfterLoaded = 'afterReloaded';
	export const Deactivated = 'deactivates';
	export const Expanded = 'expanded';
	export const Added = 'added';
}

export class Entry extends Page {
	public constructor(
		public readonly entries: EntryItem[] = []
	) {
		super([EntryEvents.BeforeLoaded, EntryEvents.AfterLoaded]);
		this.load();
		ko.track(this);
	}

	public async load(dir = '/'): Promise<void> {
		try {
			const url = '?dir=' + encodeURIComponent(dir);
			this._transition(States.Loading);
			const entries = (await Http.get<EntryEntity[]>(`/entry/${url}`)).map(entity => EntryItem.toEntry(entity));
			this.removeAll();
			this.adds(this.entries);
			this.add(new EntryAdd());
			this.closeAll();
		} catch (err) {
			// XXX
		}
		this._transition(States.Syncronized);
	}

	public new(path: string): void {
		const entity: EntryEntity = {
			path: path,
			isFile: true,
			isText: true,
			content: 'hoge' // XXX empty
		};
		this.add(new EntryFile(entity));
	}

	public add(entry: EntryItem): void {
		entry.on(EntryEvents.Created, this._onCreated);
		entry.on(EntryEvents.Deleted, this._onDeleted);
		entry.on(EntryEvents.BeforeLoaded, this._onBeforeLoaded);
		entry.on(EntryEvents.AfterLoaded, this._onAfterLoaded);
		entry.on(EntryEvents.Deactivated, this._onDeactivated);
		entry.on(EntryEvents.Expanded, this._onExpanded);
		entry.on(EntryEvents.Added, this._onAdded);
	}

	public adds(entries: EntryItem[]): void {
		for (const entry of entries) {
			this.add(entry);
		}
	}

	public remove(entry: EntryItem): EntryItem[] {
		return this.entries.remove(entry);
	}

	public removeAll(): void {
		this.entries.removeAll();
	}

	public closeAll(): void {
		for (const entry of this.entries) {
			if (entry instanceof EntryDirectory) {
				entry.click(); // XXX rename
			}
		}
	}

	public at(path: string): EntryItem | null { // XXX nullable
		for (const entry of this.entries) {
			if (entry.path === path) {
				return entry;
			}
		}
		return null;
	}

	private _onCreated(sender: EntryItem): boolean {
		this.add(sender);
		return false;
	}

	private _onDeleted(sender: EntryItem): boolean {
		this.remove(sender);
		return false;
	}

	private _onBeforeLoaded(sender: any, e: any): boolean {
		this.emit(EntryEvents.BeforeLoaded, sender, e);
		return true;
	}

	private _onAfterLoaded(sender: any, e: any): boolean {
		this.emit(EntryEvents.AfterLoaded, sender, e);
		return true;
	}

	private _onDeactivated(sender: EntryItem): boolean {
		for (const entry of this.entries) {
			if (entry.display.active) {
				entry.display.active = false;
				break;
			}
		}
		return false;
	}

	private _onExpanded(sender: EntryDirectory): boolean {
		const opened = !sender.opened;
		for (const entry of this.entries) {
			if (entry.dir.startsWith(sender.dir)) {
				if (opened && entry.closes > 0) {
					entry.closes -= 1;
				} else if (!opened) {
					entry.closes += 1;
				}
				entry.display.close = entry.closes > 0;
			}
		}
		return false;
	}

	private _onAdded(sender: any, e: any): boolean {
		this.emit(EntryEvents.Added, sender, e);
		return true;
	}

	// @override
	protected get syncronizedIcon(): Icons {
		return Icons.Entry;
	}
}

export class EntryItem extends EventEmitter {
	public path: string;
	public isFile: boolean;
	public isText: boolean;
	public content: string; // | Buffer; XXX
	public dir: string;
	public name: string;
	public icon: string;
	public closes: number;
	public display: any; // XXX any
	public edit: any;

	public constructor(entity: EntryEntity) {
		super([
			EntryEvents.Created,
			EntryEvents.Deleted,
			EntryEvents.BeforeLoaded,
			EntryEvents.AfterLoaded,
			EntryEvents.Deactivated,
			EntryEvents.Expanded,
			EntryEvents.Added
		]);
		const path = entity.path.replace(/\/$/, '');
		const routes = path.substr(1).split('/');
		const depth = Math.max(1, routes.length);
		const name = Path.basename(path);
		const dir = Path.join('/', ...routes);
		this.path = path;
		this.isFile = entity.isFile;
		this.isText = entity.isText;
		this.content = '';
		this.dir = dir;
		this.name = name;
		this.icon = EntryItem.toIcon(this.isFile ? EntryTypes.File : EntryTypes.Directory);
		this.closes = 0;
		this.display = {
			active: false,
			close: false,
			[`depth${depth}`]: true
		};
		this.edit = {
			close: true
		};
	}

	protected _bind(): void {
		ko.track(this);
		ko.track(this.display);
		ko.track(this.edit);
	}

	public async create(path: string): Promise<boolean> {
		const created = await Http.post<boolean>('/entry/', {data: {path: path}});
		if (created) {
			const entity: EntryEntity = {
				path: path,
				isFile: true,
				isText: true,
				content: ''
			};
			this.emit(EntryEvents.Created, this, new EntryFile(entity));
		}
		return created;
	}

	public async update(content: string): Promise<boolean> {
		const url = encodeURIComponent(this.path);
		const updated = await Http.put<boolean>(`/entry/${url}`, {data: {content: content}});
		if (updated) {
			this.emit(EntryEvents.Updated, this, updated);
		}
		return updated;
	}

	public async rename(to: string): Promise<boolean> {
		// FIXME via shownRename
		if (!Path.valid(to)) {
			return false;
		}
		const encodePath = encodeURIComponent(this.path);
		const encodeTo = encodeURIComponent(to);
		const url = `/${encodePath}/rename?to=${encodeTo}`;
		const renamed = await Http.put<boolean>(`/entry/${url}`);
		if (renamed) {
			this.path = to;
			this.name = Path.basename(to);
			this.emit(EntryEvents.Renamed, this, renamed);
		}
		return renamed;
	}

	public async delete(): Promise<boolean> {
		// FIXME via shownDelete
		const prev = this.path + (!this.isFile ? '/' : ''); // XXX directory is ends with '/'
		const url = encodeURIComponent(prev);
		const deleted = await Http.delete<boolean>(`/entry/${url}`);
		if (deleted) {
			this.emit(EntryEvents.Deleted, this);
		}
		return deleted;
	}

	public backup(content: string): void {
		localStorage.setItem(this.path, content);
	}

	public restore(): string {
		const content = localStorage.getItem(this.path) || '';
		if (content) {
			localStorage.removeItem(this.path);
		}
		return content;
	}

	public allow(): void {
		this.edit.close = !this.edit.close;
	}

	public static toEntry(entity: EntryEntity): EntryItem {
		if (entity.isFile) {
			return new EntryFile(entity);
		} else {
			return new EntryDirectory(entity);
		}
	}

	public static toIcon(type: EntryTypes): Icons {
		const classes = {
			[EntryTypes.File]: Icons.Empty,
			[EntryTypes.FileOpen]: Icons.FileOpen,
			[EntryTypes.Directory]: Icons.Directory,
			[EntryTypes.DirectoryClose]: Icons.DirectoryClose,
			[EntryTypes.FileAdd]: Icons.FileAdd
		};
		return (type in classes) ? <any>classes[type] : Icons.Empty; // XXX any
	}
}

class EntryFile extends EntryItem {
	public constructor(entity: EntryEntity) {
		super(entity);
		this._bind();
	}

	public click(): void {
		this._load();
	}

	public async update(content: string): Promise<boolean> {
		const updated = await super.update(content);
		if (updated) {
			this.content = content;
		}
		return updated;
	}

	private async _load(): Promise<void> {
		this.emit(EntryEvents.BeforeLoaded, this);
		if (this.content === '') {
			const url = encodeURIComponent(this.path);
			const entity = await Http.get<EntryEntity>(`/entry/${url}`);
			this.content = entity.content;
			this._activate();
			this.emit(EntryEvents.AfterLoaded, this);
			this.icon = EntryItem.toIcon(EntryTypes.FileOpen);
		} else {
			this._activate();
			this.emit(EntryEvents.AfterLoaded, this);
		}
	}

	private _activate(): void {
		this.emit(EntryEvents.Deactivated, this);
		this.display.active = true;
	}
}

class EntryDirectory extends EntryItem {
	public opened: boolean;

	constructor (entity: EntryEntity) {
		super(entity);
		this.opened = true;
		this._bind();
	}

	public click(): void {
		this.emit(EntryEvents.Expanded, this);
		this.opened = !this.opened;
		this.icon = EntryItem.toIcon(this.opened ? EntryTypes.Directory : EntryTypes.DirectoryClose);
	}
}

class EntryAdd extends EntryItem {
	public constructor() {
		super({
			path: '',
			isFile: false,
			isText: false,
			content: ''
		});
		this.icon = EntryItem.toIcon(EntryTypes.FileAdd);
		this._bind();
	}

	public click(): void {
		// FIXME via shownCreate
		// if (Path.valid(path)) {
		// 	this.create(path);
		// };
		this.emit(EntryEvents.Added, this);
	}
}
