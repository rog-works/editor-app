'use strict'

const Controller = require('../components/controller');
const Router = require('../components/router');

class IndexController extends Controller {
	constructor () {
		super();
	}

	index () {
		this.res.sendFile('/opt/app/_editor/app/views/index.html');
	}

	routes () {
		return [
			Router.get('/').on('index')
		];
	}
}

module.exports = Router.bind(new IndexController());
