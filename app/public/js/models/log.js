'use strict';

class Log extends Page {
	constructor () {
		super();
		this.logs = ko.observableArray([]);
	}

	clear () {
		this.logs.removeAll();
	}

	put (log) {
		return this._on(log, false);
	}

	line (log) {
		return this._on(log, true);
	}

	_on (log, separated) {
		// console.log(log, separated);
		this.logs.push(new LogLine(log, separated, this.coloring(log)));
		return true;
	}

	coloring (log) {
		return '#0f0';
	}
}

class LogLine {
	constructor (log, color, separated) {
		this.log = ko.observable(log);
		this.color = {color: color};
		this.closed = ko.observable(false);
		this.separated = ko.observable(separated);
	}

	expand () {
		this.closed(!this.closed());
	}
}
