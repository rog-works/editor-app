'use strict'

const Controller = require('../components/controller');
const Router = require('../components/router');
const Debugger = require('../components/debugger');

class IndexController extends Controller {
	constructor () {
		super();
		this.server = null;
		this.client = new Debugger();
		this._bind();
	}

	_bind () {
		const self = this;
		[
			// emit event?
			'connect',//todo
			'close',//todo
			// v8 protocols
			// - activation
			'continue',//todo
			'disonnect',//todo
			'frame',
			// 'suspend',//xxx
			// 'restartframe',//xxx
			// - source mapping
			'scripts',
			'source',
			'backtrace',
			// 'changelive',//xxx
			// - break point
			'setexceptionbreak',
			'listbreakpoints',
			'clearbreakpoint',//todo
			'changebreakpoint',
			'setbreakpoint',//todo
			// - variable
			'evalute',
			'scope',
			'scopes',
			'lookup',
			'setvariablevalue',
			// - utility
			'version',
			'gc',
			'v8flags',
			// - event
			'break',
			'exception'
		].forEach((key) => {
			const camelKey = `${key[0].toUpperCase()}${key.substr(1)}`;
			const handleKey = `on${camelKey}`;
			if (handleKey in this) {
				this.client.on(key, (res) => { self[handleKey](res); });
			}
		});
	}

	// emit event

	connect () {
		this.client.connect();
	}

	close () {
		this.client.close();
	}

	// v8 protocols
	// - activation

	continue (action = 'next', count = 1) {
		this.client.send('continue', {stepaction: action, stepcount: count});
	}

	disconnect () {
		this.client.send('disconnect');
	}

	frame (...args) {
		console.log(...args);
	}

	// - source mapping

	scripts (...args) {
		console.log(...args);
	}

	source (...args) {
		console.log(...args);
	}

	backtrace (...args) {
		console.log(...args);
	}

	// - break point

	setexceptionbreak (...args) {
		console.log(...args);
	}

	listbreakpoints () {
		this.client.send('listbreakpoints');
	}

	clearbreakpoint (breakPointId) {
		console.log('clearbreakpoint', {breakpoint: breakPointId});
	}

	changebreakpoint (breakPointId, enabled = true) {
		this.client.send('changebreakpoint', {breakpoint: breakPointId, enabled: enabled});
	}

	onChangebreakpoint (res) {
		// XXX 
		// this.breakpoints[res.breakpoint] = res;
	}

	setbreakpoint (path, line) {
		this.client.send('setbreakpoint', {target: path, line: line, type: 'script', enabled: true});
	}

	onSetbreakpoint (res) {
		this.breakpoints[res.breakpoint] = res;
	}

	// - variable

	evalute (...args) {
		console.log(...args);
	}

	scope (...args) {
		console.log(...args);
	}

	scopes (...args) {
		console.log(...args);
	}

	lookup (...args) {
		console.log(...args);
	}

	setvariablevalue (...args) {
		console.log(...args);
	}

	// - utility

	version (...args) {
		console.log(...args);
	}

	gc (...args) {
		console.log(...args);
	}

	v8flags (...args) {
		console.log(...args);
	}

	// event

	break (...args) {
		console.log(...args);
	}

	exception (...args) {
		console.log(...args);
	}

	routes () {
		return [
			Router.get('/').on('start')
		];
	}
}

module.exports = Router.bind(new IndexController());
