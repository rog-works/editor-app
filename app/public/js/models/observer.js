'use strict';

class Observer {
	constructor () {
		this.icon = ko.observable('fa-home');
		this.handlers = {};
	}

	static init () {
		return new Observer();
	}

	_on (tag, message) {
		if (!(tag in this.handlers)) {
			this.handlers[tag] = 0;
		}
		
		const prev = this.handlers[tag];
		let next = prev;
		if (message.startsWith('started')) {
			next += 1;
		} else {
			next = Math.max(0, next - 1);
		}
		this.handlers[tag] = next;
		console.log('On', tag, message, this.handlers[tag]);
		return [prev, next];
	}

	connect (message) {
		const [prev, next] = this._on('connect', message);
		const isFinished = next === 0 && prev > 0;
		const isStarted = next > 0 && prev === 0;
		if (isStarted) {
			this.icon('fa-refresh fa-spin');
		} else if (isFinished) {
			this.icon('fa-home');
		}
	}
}
