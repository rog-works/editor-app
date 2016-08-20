'use strict';

const Entity = require('../entities/entry');
const Controller = require('../components/controller');
const Router = require('../components/router');

const PATH_REGULAR = '[\\w\\-.%]+';

class EntryController extends Controller {
	constructor () {
		super();
	}

	index (dir = '') {
		this.view(Entity.entries(dir));
	}

	show (path) {
		this.view(Entity.at(path));
	}

	create (path) {
		this.view(Entity.create(path));
	}

	update (path, content) {
		this.view(Entity.update(path, content));
	}

	destroy (path) {
		this.view(Entity.destroy(path));
	}

	rename (path, to) {
		this.view(Entity.rename(path, to));
	}

	keys () {
		return Entity.keys();
	}

	routes () {
		return [
			Router.get('/')
				.query('dir')
				.on('index'),
			Router.get(`/:path(${PATH_REGULAR})`)
				.params('path')
				.on('show'),
			Router.post('/')
				.body('path')
				.on('create'),
			Router.put(`/:path(${PATH_REGULAR})`)
				.params('path')
				.body('content')
				.on('update'),
			Router.delete(`/:path(${PATH_REGULAR})`)
				.params('path')
				.on('destroy'),
			Router.put(`/:path(${PATH_REGULAR})/rename`)
				.params('path')
				.query('to')
				.on('rename')
		];
	}
}

module.exports = Router.bind(new EntryController());
