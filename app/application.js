'use strict'

const Express = require('express');

const PUBLIC_ROOT_PATH = '/opt/app/app/app/public';
const ACCESS_LOG_PATH = '/var/log/app/editor.log';

class Application {
	constructor () {
		this.app = Express();
	}

	_log () {
		const morgan = require('morgan');
		const stream = require('fs').createWriteStream(ACCESS_LOG_PATH, {flags: 'a'});
		const options = { stream: stream };
		const format = [
			':remote-addr',
			'-',
			':remote-user',
			'[:date[iso]]',
			'":method :url HTTP/:http-version"',
			':status',
			':res[content-length]',
			':response-time',
			'":referrer"',
			'":user-agent"'
		].join(' ');
		morgan.format('my', format);
		return morgan('my', options);
	}

	depended () {
		this.app.use(require('compression')());
		this.app.use(Express.static(PUBLIC_ROOT_PATH));
		this.app.use(require('body-parser').urlencoded({ extended: false }));
		this.app.use(this._log());
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
