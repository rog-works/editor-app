import * as fs from 'fs';
import * as Express from 'express';
import * as Morgan from 'morgan';
import * as BodyParser from 'body-parser';
import Router from '../components/Router';
import IndexController from '../controllers/IndexController';
import EntryController from '../controllers/EntryController';
import ShellController from '../controllers/ShellController';

export default class Application {
	public static readonly PUBLIC_ROOT_PATH = '/opt/app/app/app/public';
	public static readonly ACCESS_LOG_PATH = '/var/log/app/editor.log';

	private constructor (
		private _app = Express()
	) {}

	private _log(): Express.RequestHandler {
		const stream = fs.createWriteStream(Application.ACCESS_LOG_PATH, { flags: 'a' });
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
		Morgan.format('my', format);
		return Morgan('my', options);
	}

	private _depended(): void {
		// this._app.use(require('compression')());
		this._app.use(Express.static(Application.PUBLIC_ROOT_PATH));
		this._app.use(BodyParser.urlencoded({ extended: false }));
		this._app.use(this._log());
	}

	private _bind(): void {
		// FIXME 
		this._app.use('/', Router.bind(IndexController));
		this._app.use('/entry', Router.bind(EntryController));
		this._app.use('/shell', Router.bind(ShellController));
	}

	public static listen(port: number): void {
		const self = new Application();
		self._depended();
		self._bind();
		self._app.listen(port, () => {
			console.log('INFO', `Listening on port ${port}`);
		});
	}
}
