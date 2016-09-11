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
		this.on('expand', this.expand);
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
		EntryItem.send(url)
			.then((entities) => {
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
		this.addNode(entry);
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

	expand (dir, opened) {
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
		this.path = path;
		this.isFile = entity.isFile;
		this.content = '';
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

	static send (path, exData = {}) {
		return new Promise((resolve, reject = null) => {
			const url = `/entry${path}`;
			const base = {
				url: url,
				type: 'GET',
				dataType: 'json',
				timeout: 1000,
				success: (res) => {
					console.log('Respond', data.type, data.url);
					resolve(res);
				},
				error: (res, err) => {
					console.error('Failed request', data.type, data.url, err, res.status, res.statusText, res.responseText);
					if (reject !== null) {
						reject(err);
					}
				}
			};
			const data = $.extend(base, exData);
			console.log('Request', data.type, data.url);
			$.ajax(data);
		});
	}

	create (path) {
		return EntryItem.send('/', {type: 'POST', data: {path: path}})
			.then((created) => {
				const entity = {
					path: path,
					isFile: true,
					content: ''
				};
				this.fire('created', EntryItem.toEntry(entity));
			});
	}

	update (content) {
		const url = '/' + encodeURIComponent(this.path);
		return EntryItem.send(url, {type: 'PUT', data: {content: content}});
	}

	rename () {
		this.fireAsync('shownRename', this.path)
			.then((to) => {
				if (!EntryItem.validSavePath(to)) {
					return;
				}
				const encodePath = encodeURIComponent(this.path);
				const encodeTo = encodeURIComponent(to);
				const url = `/${encodePath}/rename?to=${encodeTo}`;
				EntryItem.send(url, {type: 'PUT'})
					.then((renamed) => {
						this.path = to;
						// XXX
						this.name(to.split('/').pop());
					});
			});
	}

	delete () {
		this.fireAsync('shownDelete', this.path)
			.then((ok) => {
				if (!ok) {
					console.log('Delete canceled');
					return;
				}
				// XXX
				const prev = this.path + (!this.isFile ? '/' : '');
				const url = '/' + encodeURIComponent(prev);
				EntryItem.send(url, {type: 'DELETE'})
					.then((deleted) => {
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
			console.warn('Invalid save path', path);
			return false;
		}
		if (/[^\d\w\-\/_.]+/.test(path)) {
			console.warn('Not allowed path characters', path);
			return false;
		}
		return true;
	}

	static toIcon (type) {
		const classes = {
			file: '',
			fileOpen: 'fa-download',
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

	update (content) {
		return super.update(content)
			.then((updated) => {
				this.content = content;
				return updated;
			})
			.catch((err) => {
				this.content = content;
			});
	}

	_load (path = '/') {
		this.fire('beforeReload', path);
		const url = '/' + encodeURIComponent(path);
		if (this.content === '') {
			EntryItem.send(url)
				.then((entity) => {
					this.content = entity.content;
					this._activate();
					this.fire('afterReload', entity.path, entity.content);
					this.icon(EntryItem.toIcon('fileOpen'));
				});
		} else {
			this._activate();
			this.fire('afterReload', this.path, this.content);
		}
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
		this.fire('expand', this.path, this.opened);
	}
}

class EntryAdd extends EntryItem {
	constructor () {
		super({
			path: '',
			isFile: false,
			content: ''
		});
		this.icon(EntryItem.toIcon('add'));
	}

	click () {
		this.fireAsync('shownCreate')
			.then((path) => {
				if (EntryItem.validSavePath(path)) {
					this.create(path);
				};
			});
	}
}
