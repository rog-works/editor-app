'use strict';

class Logger {
	constructor (owner) {
		if (typeof owner !== 'object' || !owner.hasOwnProperty('logs')) {
			throw new Error('Expected has logs');
		}
		this.owner = owner;
	}

	put (log) {
		return this._push(log, false);
	}

	line (log) {
		return this._push(log, true);
	}

	_push (log, separated) {
		// console.log(log, separated);
		this.owner.logs.push(new LogLine(log, this._coloring(log), separated));
		return true;
	}

	_coloring (line) {
		if ('coloring' in this.owner) {
			return this.owner.coloring(line);
		} else {
			return 'fc1';
		}
	}
}

class LogLine {
	constructor (log, color, separated) {
		this.log = ko.observable(log);
		this.css = {[color]: true};
		this.closed = ko.observable(false);
		this.separated = ko.observable(separated);
	}

	expand () {
		this.closed(!this.closed());
	}
}
