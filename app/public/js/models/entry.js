'use strict';

class Entry extends Page {
	constructor () {
		super();
		this.STATE_RUN = 'run';
		this.ICON_STATE_RUN = 'fa-sitemap';

		this.entries = ko.observableArray([]);
		this.icon[this.ICON_STATE_RUN] = ko.observable(true);
		this.on('created', this.created);
		this.on('deleted', this.deleted);
		this.on('deactivate', this.deactivate);
		this.on('expanded', this.expanded);
	}

	static init (id = 'page-entry') {
		const self = new Entry();
		// ko.applyBindings(self, document.getElementById(id));
		self.load();
		return self;
	}

	load (dir = '/') {
		const url = '/?dir=' + encodeURIComponent(dir);
		this._transition(this.STATE_LOADING);
		EntryItem.send(url, {}, (entities) => {
			this.entries.removeAll();
			const entries = entities.map((entity) => {
				return EntryItem.toEntry(entity);
			});
			for (const entry of entries) {
				this.entries.push(entry);
			}
			this.entries.push(new EntryAdd());
			this.addNodes(this.entries());
			this._transition(this.STATE_RUN);
		});
	}

	at (path) {
		for (const entry of this.entries()) {
			if (entry.path === path) {
				return entry;
			}
		}
		return null;
	}

	created (entry) {
		this.entries.push(entry);
		console.log('Created entry', entry);
		return false;
	}

	deleted (entry) {
		const removed = this.entries.remove((self) => {
			return self.path === entry.path;
		});
		console.log('Deleted entry', removed);
		return false;
	}

	deactivate () {
		for (const entry of this.entries()) {
			if (entry.display.active()) {
				entry.display.active(false);
				break;
			}
		}
	}

	expanded (dir, opened) {
		for (const entry of this.entries()) {
			if (entry.dir.startsWith(dir)) {
				if (opened && entry.closes > 0) {
					entry.closes -= 1;
				} else if (!opened) {
					entry.closes += 1;
				}
				entry.display.close(entry.closes > 0);
			}
		}
	}

	_transition (state) {
		super._transition(state);
		if (state === this.STATE_RUN) {
			this.icon[this.ICON_STATE_RUN](true);
		}
	}
}

class EntryItem extends Node {
	constructor (entity) {
		super();
		const path = entity.path.replace(/\/$/, '');
		const route = path.substr(1).split('/');
		const depth = Math.max(1, route.length);
		const name = route.pop();
		const dir = '/' + route.join('/');
		this.isFile = entity.isFile;
		this.path = path;
		this.dir = dir;
		this.name = ko.observable(name);
		this.icon = ko.observable(EntryItem.toIcon(this.isFile ? 'file' : 'directory'));
		this.closes = 0;
		this.display = {
			active: ko.observable(false),
			close: ko.observable(false),
			[`depth${depth}`]: true
		};
		this.edit = {
			close: ko.observable(true)
		};
	}

	static send (path, data, callback, error = null) {
		const url = `/entry${path}`;
		const _data = {
			url: url,
			type: 'GET',
			dataType: 'json',
			timeout: 1000,
			success: (res) => {
				console.log('respond', url);
				callback(res);
			},
			error: (res, err) => {
				console.error('error', url, err, res.status, res.statusText, res.responseText);
				if (error !== null) {
					error(err);
				}
			}
		};
		console.log('request', url);
		$.ajax($.extend(_data, data));
	}

	create (path) {
		EntryItem.send('/', {type: 'POST', data: {path: path}}, (entity) => {
			this.fire('created', EntryItem.toEntry(entity));
		});
	}

	update (content, callback, error) {
		const url = '/' + encodeURIComponent(this.path);
		EntryItem.send(
			url,
			{type: 'PUT', data: {content: content}},
			callback,
			(err) => {
				if (err === 'timeout') {
					// this.backup(this.path, content);
				}
				error(err);
			}
		);
	}

	rename () {
		this.fire('prompt', 'Change file path', this.path, (to) => {
			if (!EntryItem.validSavePath(to) || EntryItem.pathExists(to)) {
				return;
			}
			const encodePath = encodeURIComponent(this.path);
			const encodeTo = encodeURIComponent(to);
			const url = `/${encodePath}/rename?to=${encodeTo}`;
			EntryItem.send(url, {type: 'PUT'}, (toPath) => {
				this.path = toPath;
				// XXX
				this.name(toPath.join('/').pop());
			});
		});
	}

	delete () {
		this.fire('confirm', `'${this.path}' deleted?`, (ok) => {
			if (!ok) {
				console.log('Delete canceled');
				return;
			}
			const prev = this.path;
			const url = '/' + encodeURIComponent(prev);
			EntryItem.send(url, {type: 'DELETE'}, (deleted) => {
				this.fire('deleted', this);
			});
		});
	}

	backup (content) {
		localStorage.setItem(this.path, content);
	}

	restore () {
		const content = localStorage.getItem(this.path);
		if (content) {
			localStorage.removeItem(this.path);
		}
		return content;
	}

	allow () {
		this.edit.close(!this.edit.close());
	}

	static toEntry(entity) {
		if (entity.isFile) {
			return new EntryFile(entity);
		} else {
			return new EntryDirectory(entity);
		}
	}

	static validSavePath (path) {
		if (typeof path !== 'string' || path.length === 0) {
			console.log('Save canceled');
			return false;
		}
		if (/[^\d\w\-\/_.]+/.test(path)) {
			console.log('Not allowed path characters');
			return false;
		}
		return true;
	}

	static pathExists (path) {
		// XXX depends on entry
		for (const entry of APP.entry.entries()) {
			if (entry.path === path) {
				return true;
			}
		}
		return false;
	}

	static toIcon (type) {
		const classes = {
			file: '',
			directory: 'fa-folder-open',
			directoryClose:  'fa-folder',
			add: 'fa-plus'
		};
		return classes[type];
	}
}

class EntryFile extends EntryItem {
	constructor (entity) {
		super(entity);
	}

	click () {
		this._load(this.path);
	}

	_load (path = '/') {
		const url = '/' + encodeURIComponent(path);
		EntryItem.send(url, {}, (entity) => {
			this._activate();
			this.fire('reload', entity.path, entity.content);
		});
	}

	_activate () {
		this.fire('deactivate');
		this.display.active(true);
	}
}

class EntryDirectory extends EntryItem {
	constructor (entity) {
		super(entity);
		this.opened = true;
	}

	click () {
		this.opened = !this.opened;
		const nextIcon = EntryItem.toIcon(this.opened ? 'directory' : 'directoryClose');
		this.icon(nextIcon);
		this.fire('expanded', this.path, this.opened);
	}
}

class EntryAdd extends EntryItem {
	constructor () {
		super({
			isFile: false,
			path: '',
			content: ''
		});
		this.icon(EntryItem.toIcon('add'));
	}

	click () {
		this.fire('prompt', 'Input create file path', '/', (path) => {
			if (EntryItem.validSavePath(path) && !EntryItem.pathExists(path)) {
				this.create(path);
			}
		});
	}
}
