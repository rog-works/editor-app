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

export type EntryEvents = 'created' | 'updated' | 'deleted' | 'renamed' | 'beforeReload' | 'afterReload' | 'deactivate' | 'expand' | 'added' | 'connectFailed';
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
	export const ConnectFailed = 'connectFailed';
}

export class Entry extends Page {
	public constructor(
		public entries: EntryItem[] = []
	) {
		super([
			EntryEvents.BeforeLoaded,
			EntryEvents.AfterLoaded,
			EntryEvents.Added
		]);
		this.load();
		ko.track(this);
	}

	public async load(dir = '/'): Promise<void> {
		try {
			const url = '?dir=' + encodeURIComponent(dir);
			this._transition(States.Loading);
			const entries = (await Http.get<EntryEntity[]>(`/entry/${url}`)).map(entity => EntryItem.toEntry(entity));
			this.removeAll();
			this.adds(entries);
			this.add(new EntryAdd());
			this.closeAll();
		} catch (error) {
			// XXX
		}
		this._transition(States.Syncronized);
	}

	public async create(path: string): Promise<void> { // XXX
		const entity: EntryEntity = {
			path: path,
			isFile: true,
			isText: true,
			content: 'empty' // XXX empty
		};
		const entry = new EntryFile(entity);
		this._bindEntry(entry);
		const created = await entry.create();
		if (created) {
			this.entries.push(entry);
		}
	}

	private _bindEntry(entry: EntryItem): void {
		entry.on(EntryEvents.BeforeLoaded, this._onBeforeLoaded.bind(this));
		entry.on(EntryEvents.AfterLoaded, this._onAfterLoaded.bind(this));
		entry.on(EntryEvents.Deactivated, this._onDeactivated.bind(this));
		entry.on(EntryEvents.Expanded, this._onExpanded.bind(this));
		entry.on(EntryEvents.Added, this._onAdded.bind(this));
		entry.on(EntryEvents.ConnectFailed, this._onConnectFailed.bind(this));
	}

	public async delete(target: EntryItem): Promise<void> { // XXX
		const deleted = await target.delete();
		if (deleted) {
			this.remove(target);
		}
	}

	public add(entry: EntryItem): void {
		this._bindEntry(entry);
		this.entries.push(entry);
	}

	public adds(entries: EntryItem[]): void {
		for (const entry of entries) {
			this.add(entry);
		}
	}

	public remove(target: EntryItem): EntryItem[] {
		const index = this.entries.indexOf(target);
		return index !== -1 ? this.entries.splice(index, 1) : [];
	}

	public removeAll(): void {
		this.entries = [];
	}

	public closeAll(): void {
		for (const entry of this.entries) {
			if (entry instanceof EntryDirectory) {
				entry.expand();
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

	// @override
	protected get syncronizedIcon(): Icons {
		return Icons.Entry;
	}

	private _onUpdated(sender: EntryItem): boolean {
		this._transition(States.Syncronized);
		return false;
	}

	private _onBeforeLoaded(sender: any, e: any): boolean { // FIXME callable?
		this.emit(EntryEvents.BeforeLoaded, sender, e);
		return true;
	}

	private _onAfterLoaded(sender: any, e: any): boolean { // FIXME callable?
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
		const opened = sender.opened;
		for (const entry of this.entries) {
			if (entry.dir.startsWith(sender.path)) {
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

	private _onAdded(sender: EntryItem): boolean {
		this.emit(EntryEvents.Added, sender);
		return true;
	}

	private _onConnectFailed(sender: EntryItem): boolean {
		this._transition(States.Error);
		return true;
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
			EntryEvents.Updated,
			EntryEvents.Renamed,
			EntryEvents.BeforeLoaded,
			EntryEvents.AfterLoaded,
			EntryEvents.Deactivated,
			EntryEvents.Expanded,
			EntryEvents.Added,
			EntryEvents.ConnectFailed
		]);
		const path = entity.path.replace(/\/$/, '');
		const routes = path.substr(1).split('/');
		const depth = Math.max(1, routes.length);
		const name = routes.pop() || ''; // XXX decrese routes
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

	public async create(): Promise<boolean> {
		try {
			const created = await Http.post<boolean>('/entry/', { path: this.path });
			if (created) {
				this.emit(EntryEvents.Created, this);
			}
			return created;
		} catch (error) {
			this.emit(EntryEvents.ConnectFailed, this);
			return false;
		}
	}

	public async update(content: string): Promise<boolean> {
		try {
			const url = encodeURIComponent(this.path);
			const updated = await Http.put<boolean>(`/entry/${url}`, { content: content });
			if (updated) {
				this.content = content;
				this.emit(EntryEvents.Updated, this);
			}
			return updated;
		} catch (error) {
			this.emit(EntryEvents.ConnectFailed, this);
			return false;
		}
	}

	public async rename(to: string): Promise<boolean> {
		if (!Path.valid(to)) {
			return false;
		}
		try {
			const encodePath = encodeURIComponent(this.path);
			const encodeTo = encodeURIComponent(to);
			const url = `/${encodePath}/rename?to=${encodeTo}`;
			const renamed = await Http.put<boolean>(`/entry/${url}`);
			if (renamed) {
				this.path = to;
				this.name = Path.basename(to);
				this.emit(EntryEvents.Renamed, this);
			}
			return renamed;
		} catch (error) {
			this.emit(EntryEvents.ConnectFailed, this);
			return false;
		}
	}

	public async delete(): Promise<boolean> {
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

	private async _load(): Promise<boolean> {
		this.emit(EntryEvents.BeforeLoaded, this);
		if (this.content !== '') {
			this._activate();
			this.emit(EntryEvents.AfterLoaded, this);
			return true;
		}

		try {
			const url = encodeURIComponent(this.path);
			const entity = await Http.get<EntryEntity>(`/entry/${url}`);
			this.content = entity.content;
			this.icon = EntryItem.toIcon(EntryTypes.FileOpen);
			this._activate();
			this.emit(EntryEvents.AfterLoaded, this);
			return true;
		} catch (error) {
			this.emit(EntryEvents.ConnectFailed, this);
			return false;
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
		this.expand();
	}

	public expand(): void {
		this.opened = !this.opened;
		this.icon = EntryItem.toIcon(this.opened ? EntryTypes.Directory : EntryTypes.DirectoryClose);
		this.emit(EntryEvents.Expanded, this);
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
		this.emit(EntryEvents.Added, this);
	}
}
