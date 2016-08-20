'use strict';

const Entity = require('../entities/shell');
const Controller = require('../components/controller');
const Router = require('../components/router');

class ShellController extends Controller {
	constructor () {
		super();
	}

	run (query, dir = '') {
		let args = query.split(' ');
		let command = args.shift();
		let options = {cwd: `/opt/app${dir}`};
		let result = (new Entity()).run(command, args, options);
		this.view(result);
	}

	routes () {
		return [
			Router.post('/')
				.body('query')
				.query('dir')
				.on('run')
		];
	}
}

module.exports = Router.bind(new ShellController());
