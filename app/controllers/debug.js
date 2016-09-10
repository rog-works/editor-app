'use strict'

const Controller = require('../components/controller');
const Router = require('../components/router');

class IndexController extends Controller {
	constructor () {
		super();
		this.server = null;
	}

	start () {
		const self = this;
		this.server = require('net').createServer();
		[
			// emit event?
			'connect',//todo
			'close',//todo
			// v8 protocols
			// - activation
			'continue',//todo
			'disonnect',//todo
			'frame',
			'suspend',//xxx
			'restartframe',//xxx
			// - source mapping
			'scripts',
			'source',
			'backtrace',
			'changelive',//xxx
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
			'v8flags'
		].forEach((key) => {
			this.server.on(key, self[key]);
		});
		[
			'break',
			'exception'
		].forEach((key) => {
			this.server.on(key, self[key]);
		});
		this.server.listen(18083);
	}

	// emit event

	connect (...args) {
		console.log(...args);
	}

	close (...args) {
		console.log(...args);
	}

	// v8 protocols
	// - activation

	continue (...args) {
		console.log(...args);
	}

	disconnect (...args) {
		console.log(...args);
	}

	frame (...args) {
		console.log(...args);
	}

	suspend (...args) {
		console.log(...args);
	}

	restartframe (...args) {
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

	changelive (...args) {
		console.log(...args);
	}

	// - break point

	setexceptionbreak (...args) {
		console.log(...args);
	}

	listbreakpoints (...args) {
		console.log(...args);
	}

	clearbreakpoint (...args) {
		console.log(...args);
	}

	changebreakpoint (...args) {
		console.log(...args);
	}

	setbreakpoint (...args) {
		console.log(...args);
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
