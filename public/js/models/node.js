'use strict';

class Node {
	constructor () {
		this.parent = null;
		this.handlers = [];
	}

	addNode (node) {
		node.parent = this;
	}

	addNodes (nodes) {
		for (const node of nodes) {
			node.parent = this;
		}
	}

	on (tag, callback) {
		if (!(tag in this.handlers)) {
			this.handlers[tag] = [];
		}
		this.handlers[tag].unshift(callback);
	}

	fire (tag, ...args) {
		if (this.parent !== null) {
			this.parent._bubble(tag, ...args);
		}
	}

	_bubble (tag, ...args) {
		if (tag in this.handlers) {
			for (const callback of this.handlers[tag]) {
				// XXX deprecated apply
				if (!callback.apply(this, args)) {
					break;
				}
			}
		}
		if (this.parent !== null) {
			this.parent._bubble(tag, ...args);
		}
	}

	fireAsync (tag, ...args) {
		if (this.parent !== null) {
			const promises = this.parent._bubbleAsync(tag, ...args);
			return promises.length > 1 ? Promise.all(promises) : promises[0];
		}
		throw new Error('Parent not found');
	}

	_bubbleAsync (tag, ...args) {
		const promises = [];
		if (tag in this.handlers) {
			for (const callback of this.handlers[tag]) {
				const promise = callback.apply(this, args);
				if (promise instanceof Promise) {
					promises.push(promise);
				} else if (!promise) {
					break;
				}
			}
		}
		if (this.parent !== null) {
			this.parent._bubbleAsync(tag, ...args).forEach((self) => {
				promises.push(self);
			});
		}
		return promises;
	}
}

class Page extends Node {
	constructor () {
		super();
		this.STATE_LOADING = 'loading';

		this.size = {
			width: ko.observable(false),
			height: ko.observable(false)
		};
		this.display = {
			active: ko.observable(false)
		};
		this.icon = {
			'fa-refresh': ko.observable(false),
			'fa-spin': ko.observable(false)
		};
	}

	resize (width = false, height = false) {
		this.size.width(width)
		this.size.height(height);
	}

	activate (focused) {
		this.display.active(focused);
	}

	_transition (state) {
		for (const key in this.icon) {
			this.icon[key](false);
		}
		if (state === this.STATE_LOADING) {
			this.icon['fa-refresh'](true);
			this.icon['fa-spin'](true);
		}
	}
}
