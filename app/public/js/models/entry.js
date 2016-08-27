'use strict';

class Entry extends Page {
	constructor () {
		super();
		this.STATE_RUN = 'run';
		this.ICON_STATE_RUN = 'fa-sitemap';

		this.entries = ko.observableArray([]);
		this.icon[this.ICON_STATE_RUN] = ko.observable(true);
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
			entities.map((entity) => {
				return EntryItem.toEntry(entity);
			}).forEach((entry) => {
				this.entries.push(entry);
			});
			this.entries.push(new EntryAdd());
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

	_transition (state) {
		super._transition(state);
		if (state === this.STATE_RUN) {
			this.icon[this.ICON_STATE_RUN](true);
		}
	}
}

class EntryItem {
	constructor (entity) {
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

	static create (path) {
		EntryItem.send('/', {type: 'POST', data: {path: path}}, (entity) => {
			const entry = EntryItem.toEntry(entity);
			APP.entry.entries.push(entry);
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
		// XXX
		APP.dialog.build()
			.message('Change file path')
			.input(this.path)
			.on((to) => {
				if (!EntryItem.validSavePath(to) || EntryItem.pathExists(to)) {
					return;
				}
				const encodePath = encodeURIComponent(this.path);
				const encodeTo = encodeURIComponent(to);
				const url = `/${encodePath}/rename?to=${encodeTo}`;
				EntryItem.send(url, {type: 'PUT'}, (toPath) => {
					this.path = toPath;
				});
			})
			.prompt();
	}

	delete () {
		// XXX
		APP.dialog.build()
			.message(`'${this.path}' deleted?`)
			.on((ok) => {
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
			})
			.confirm();
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
			directoryClose:  'fa-folder',
			add: 'fa-plus'
		};
		return classes[type];
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
		APP.dialog.build()
			.message('input create file path')
			.input('/')
			.on((path) => {
				if (EntryItem.validSavePath(path) && !EntryItem.pathExists(path)) {
					EntryItem.create(path);
				}
			})
			.prompt();
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
			if (entry.display.active()) {
				entry.display.active(false);
				break;
			}
		}
		this.display.active(true);
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
			if (entry.dir.startsWith(dir)) {
				if (expanded && entry.closes > 0) {
					entry.closes -= 1;
				} else if (!expanded) {
					entry.closes += 1;
				}
				entry.display.close(entry.closes > 0);
			}
		}
	}
}
