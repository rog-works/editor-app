'use strict';

class Entry extends Page {
	constructor () {
		super();
		this.entries = ko.observableArray([]);
	}

	static init (id = 'page-entry') {
		const self = new Entry();
		// ko.applyBindings(self, document.getElementById(id));
		self.load();
		return self;
	}

	load (dir = '/') {
		const url = '/?dir=' + encodeURIComponent(dir);
		EntryItem.send(url, {}, (entities) => {
			this.entries.removeAll();
			entities.map((entity) => {
				return EntryItem.toEntry(entity);
			}).forEach((entry) => {
				this.entries.push(entry);
			});
			this.entries.push(new EntryAdd());
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
}

class EntryItem {
	constructor (entity) {
		const depth = entity.path.split('/').length;
		this.type = entity.type;
		this.path = entity.path;
		this.name = ko.observable(entity.name);
		this.icon = ko.observable(EntryItem.toIcon(this.type));
		this.selected = ko.observable(false);
		this.closed = ko.observable(0);
		this.edited = ko.observable(false);
		this.attr = {
			dir: entity.dir,
			depth: depth
		};
	}

	static send (path, data, callback) {
		const url = `/entry${path}`;
		const _data = {
			url: url,
			type: 'GET',
			dataType: 'json',
			success: (res) => {
				console.log('respond', url);
				callback(res);
			},
			error: (res, err) => {
				console.error(err, res.status, res.statusText, res.responseText);
			}
		};
		console.log('request', url);
		$.ajax($.extend(_data, data));
	}

	static create (path) {
		EntryItem.send('/', {type: 'POST', data: {path: path}}, (entity) => {
			const entry = EntryItem.toEntry(entity);
			APP.entry.entries.push(entry);
		});
	}

	update (content) {
		const url = '/' + encodeURIComponent(this.path);
		EntryItem.send(url, {type: 'PUT', data: {content: content}}, (entity) => {
			// XXX
			alert(`${this.path} entry updated!`);
		});
	}

	rename () {
		// XXX
		const to = window.prompt('change file path', this.path);
		if (!EntryItem.validSavePath(to) || EntryItem.pathExists(to)) {
			return;
		}
		const encodePath = encodeURIComponent(this.path);
		const encodeTo = encodeURIComponent(to);
		const url = `/${encodePath}/rename?to=${encodeTo}`;
		EntryItem.send(url, {type: 'PUT'}, (toPath) => {
			this.path = toPath;
		});
	}

	delete () {
		// XXX
		const ok = confirm(`'${this.path}' deleted?`);
		if (!ok) {
			console.log('delete cancel');
			return;
		}
		const prev = this.path;
		const url = '/' + encodeURIComponent(prev);
		EntryItem.send(url, {type: 'DELETE'}, (deleted) => {
			const removed = APP.entry.entries.remove((self) => {
				return self.path === prev;
			});
			console.log(removed);
		});
	}

	allow () {
		this.edited(!this.edited());
	}

	static toEntry(entity) {
		if (entity.type === 'file') {
			return new EntryFile(entity);
		} else {
			return new EntryDirectory(entity);
		}
	}

	static validSavePath (path) {
		if (typeof path !== 'string' || path.length === 0) {
			console.log('invalid argument');
			return false;
		}
		if (/[^\d\w\-\/_.]+/.test(path)) {
			console.log('not allowed path characters');
			return false;
		}
		return true;
	}

	static pathExists (path) {
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
			// XXX
			directoryClose:  'fa-folder'
		};
		return classes[type];
	}
}

class EntryAdd extends EntryItem {
	constructor () {
		super({
			type: 'file',
			path: '',
			name: '- create file -',
			dir: ''
		});
	}

	click () {
		const path = window.prompt('input create file path', '/');
		if (EntryItem.validSavePath(path) && !EntryItem.pathExists(path)) {
			EntryItem.create(path);
		}
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
			APP.editor.load(entity.path, entity.content);
			APP.editor.focus();
		});
	}

	_activate () {
		for (const entry of APP.entry.entries()) {
			if (entry.selected()) {
				entry.selected(false);
				break;
			}
		}
		this.selected(!this.selected());
	}
}

class EntryDirectory extends EntryItem {
	constructor (entity) {
		super(entity);
		this.expanded = true;
	}

	click () {
		this.expanded = !this.expanded;
		const nextIcon = EntryItem.toIcon(this.expanded ? 'directory' : 'directoryClose');
		this.icon(nextIcon);
		this._toggle(this.path, this.expanded);
	}

	_toggle (dir, expanded) {
		for (const entry of APP.entry.entries()) {
			if (entry.attr.dir.startsWith(dir)) {
				if (expanded && entry.closed() > 0) {
					entry.closed(entry.closed() - 1);
				} else if (!expanded) {
					entry.closed(entry.closed() + 1);
				}
			}
		}
	}
}
