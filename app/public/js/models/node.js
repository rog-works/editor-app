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

	fire (tag, ...e) {
		if (this.parent !== null) {
			this.parent._bubble(tag, ...e);
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
	
	selected (activate) {
		this.display.active(activate);
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
