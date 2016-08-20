'use strict'

const Express = require('express');

const PUBLIC_ROOT_PATH = '/opt/app/_editor/app/public';
const ACCESS_LOG_PATH = '/var/log/app/editor.log';

class Application {
	constructor () {
		this.app = Express();
	}

	_accessLog () {
		return require('fs').createWriteStream(ACCESS_LOG_PATH);
	}

	depended () {
		this.app.use(Express.static(PUBLIC_ROOT_PATH));
		this.app.use(require('body-parser').urlencoded({ extended: false }));
		this.app.use(require('morgan')({ stream: this._accessLog() }));
	}

	bind () {
		const controllers = {
			index: '/',
			entry: '/entry',
			shell: '/shell'
		};
		for (const key in controllers) {
			const path = controllers[key];
			const modulePath = `./controllers/${key}`;
			this.app.use(path, require(modulePath));
		}
	}

	static listen (port) {
		const self = new Application();
		self.depended();
		self.bind();
		self.app.listen(port, () => {
			console.log(`Listening on port ${port}`);
		});
	}
}

module.exports = Application;
