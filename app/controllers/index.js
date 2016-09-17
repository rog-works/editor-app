'use strict'

const Controller = require('../components/controller');
const Router = require('../components/router');

class IndexController extends Controller {
	constructor () {
		super();
	}

	index () {
		this.res.sendFile('/opt/app/app/app/views/index.html');
	}

	index2 () {
		this.res.sendFile('/opt/app/app/app/views/index2.html');
	}

	routes () {
		return [
			Router.get('/').on('index'),
			Router.get('/2').on('index2')
		];
	}
}

module.exports = Router.bind(new IndexController());
