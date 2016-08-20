'use strict';

const Render = require('../helpers/render');
const Projector = require('./projector');
const Router = require('./router');

class Controller {
	constructor () {
		this.req = null;
		this.res = null;
	}

	keys () {
		return ['id'];
	}

	routes () {
		return [
			Router.get('/')
				.on('index'),
			Router.get('/:id([\\d]+)')
				.params('id')
				.on('show'),
			Router.delete('/:id([\\d]+)')
				.params('id')
				.on('destroy')
		];
	}

	view (response, out = 'json', filter = null) {
		const keys = filter || this.keys().join('|');
		const accept = keys.split('|');
		Render[out](this.res, Projector.select(response, accept));
	}
}

module.exports = Controller;
