'use strict'

const Debugger = require('../components/v8debugger');

class Debug {
	constructor () {
		this.client = new Debugger();
		this.breakpoints = new Breakpoints();
		this._bind();
	}

	_bind () {
		[
			// - event
			'break',
			'exception'
		].forEach((key) => {
			const camelKey = `${key[0].toUpperCase()}${key.substr(1)}`;
			const handleKey = `on${camelKey}`;
			if (handleKey in this) {
				this.client.on(key, ((res) => {
					return this[handleKey](res);
				}).bind(this));
			}
		});
	}

	// socket event

	connect () {
		this.client.connect();
	}

	close () {
		this.client.close();
	}

	// v8 protocols
	// - activation

	// deprecated
	// disconnect () {
	// 	return this.client.send('disconnect');
	// }

	continue () {
		return this.client.send('continue');
	}

	in () {
		return this.client.send('continue', {stepaction: 'in'});
	}

	next (count = 1) {
		return this.client.send('continue', {stepaction: 'next'});
	}

	out (count = 1) {
		return this.client.send('continue', {stepaction: 'out'});
	}

	frame (frameId = 0) {
		return this.client.send('frame', {number: frameId});
	}

	// - source mapping

	scripts () {
		return this.client.send('scripts');
	}

	source () {
		return this.client.send('source');
	}

	backtrace () {
		return this.client.send('backtrace');
	}

	// - break point

	// type is 'all' or 'uncaught'
	setExceptionBreak (type = 'uncaught', enabled = false) {
		return this.client.send('setexceptionbreak', {type: type, enabled: enabled});
	}

	listBreakpoints () {
		return this.client.send('listbreakpoints')
			.then(((res) => {
				this.breakpoints.clear();
				res.breakpoints.forEach((resBreakPoint) => {
					this.breakpoints.add(new breakpoint(resBreakPoint));
				});
			}).bind(this));
	}

	clearBreakpoint (breakPointId) {
		return this.client.send('clearbreakpoint', {breakpoint: breakPointId})
			.then(((res) => {
				this.breakpoints.removeAt(breakPointId);
			}).bind(this));
	}

	changeBreakpoint (breakPointId, enabled = true) {
		return this.client.send('changebreakpoint', {breakpoint: breakPointId, enabled: enabled})
			.then(((res) => {
				const breakpoint = this.breakpoints.at(res.breakpoint);
				if (breakpoint !== null) {
					breakpoint.active = enabled;
				}
			}).bind(this));
	}

	setBreakpoint (path, line) {
		return this.client.send('setbreakpoint', {target: path, line: line, type: 'script', enabled: true})
			.then(((res) => {
				this.breakpoints.add(new breakpoint(res));
			}).bind(this));
	}

	// ex
	clearAllBreakpoints () {
		return Promise.all(this.breakpoints.each((breakpoint) => {
			return this.clearBreakpoint(breakpoint.id);
		}));
	}

	// - variable

	evalute () {
		return this.client.send('evalute');
	}

	scope () {
		return this.client.send('scope');
	}

	scopes () {
		return this.client.send('scopes');
	}

	lookup () {
		return this.client.send('lookup');
	}

	setvariablevalue () {
		return this.client.send('setvariablevalue');
	}

	// - system

	version () {
		return this.client.send('version');
	}

	gc () {
		return this.client.send('gc');
	}

	v8flags () {
		return this.client.send('v8flags');
	}

	// event

	onBreak (res) {
	}

	onException (res) {
	}
}

class Breakpoints {
	constructor () {
		this.list = {};
	}

	at (id) {
		return (id in this.list) ? this.list[id] : null; 
	}

	add (breakpoint) {
		this.list[breakpoint.id] = breakpoint;
	}

	removeAt (id) {
		if (id in this.list) {
			delete this.list[id];
		}
	}

	clear () {
		this.list = {};
	}

	each (func) {
		const results = [];
		for (const key in this.list) {
			results.push(func(this.list[key]));
		}
		return results;
	}
}

class breakpoint {
	constructor (entity) {
		const id = entity.number || entity.breakpoint;
		const location = entity.actual_locations.pop();
		const active = entity.active !== undefined ? entity.active : true;
		this.id = id;
		this.scriptId = location.script_id;
		this.path = entity.script_name;
		this.line = location.line;
		this.column = location.column;
		this.active = active;
	}
}

// request types
// [
// 	// socket event
// 	'connect',//todo
// 	'close',//todo
// 	// v8 protocols
// 	// - activation
// 	'continue',//todo
// 	'disonnect',//todo
// 	'frame',
// 	// 'suspend',//xxx
// 	// 'restartframe',//xxx
// 	// - source mapping
// 	'scripts',
// 	'source',
// 	'backtrace',
// 	// 'changelive',//xxx
// 	// - break point
// 	'setexceptionbreak',
// 	'listbreakpoints',
// 	'clearbreakpoint',//todo
// 	'changebreakpoint',
// 	'setbreakpoint',//todo
// 	// - variable
// 	'evalute',
// 	'scope',
// 	'scopes',
// 	'lookup',
// 	'setvariablevalue',
// 	// - system
// 	'version',
// 	'gc',
// 	'v8flags'
// ];

module.exports = Debug;
