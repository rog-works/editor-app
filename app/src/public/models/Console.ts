import * as ko from 'knockout-es5';
import Page from '../components/Page';
import {default as Logger, Log} from './log/Logger';
import LogLine from './log/LogLine';

export default class Console extends Page implements Log {
	public logs: LogLine[];
	private _logger = new Logger(this);

	public constructor() {
		super();
		this.logs = []
		this._logger = new Logger(this)
		this._bind();
		ko.track(this);
	}

	public clear(): void {
		this.logs = [];
	}

	private _bind(): void {
		const _log = console.log;
		const _warn = console.warn;
		const _error = console.error;
		const self = this;
		console.log = (...args: any[]): void => {
			_log.apply(console, args);
			self._log('LOG', ...args);
		};
		console.warn = (...args: any[]): void => {
			_warn.apply(console, args);
			self._log('WRN', ...args);
		};
		console.error = (...args: any[]): void => {
			_error.apply(console, args);
			self._log('ERR', ...args);
		};
	}

	private _log(tag: string, ...args: any[]): void {
		args.unshift(tag);
		this._logger.line(args.map((arg) => {
			if (Array.isArray(arg) || typeof arg === 'object') {
				return JSON.stringify(arg);
			} else {
				return arg;
			}
		}).join(' '));
	}
	
	public colorized(message: string): string {
		if (/^ERR/.test(message)) {
			return 'bc1-e';
		} else if (/^WRN/.test(message)) {
			return 'bc1-w';
		} else {
			return 'fc1';
		}
	}
}
