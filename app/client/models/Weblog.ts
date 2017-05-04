import * as ko from 'knockout-es5';
import {Page} from '../ui/Page';
import {Logger, Log} from './log/Logger';
import LogLine from './log/LogLine';

export default class Weblog extends Page implements Log {
	public logs: LogLine[];
	private _logger: Logger;

	public constructor() {
		super();
		this.logs = [];
		this._logger = new Logger(this);
		ko.track(this);
	}

	public clear(): void {
		this.logs = [];
	}

	public onMessage(sender: any, event: [string, any]): boolean {
		const [tag, data] = event;
		// if (tag === 'editor.access-log') {
		if (tag === 'editor.webpack-log') {
			this._log(data);
		}
		return true;
	}

	private _log(data: any): void {
		this._logger.line(this._parseLine(data));
	}

	private _parseLine(data: any): string {
		let lines = [];
		for (const key in data) {
			lines.push(data[key]);
		}
		return this.colorized(lines.join(' '));
	}

	public colorized(message: string): string {
		message = message.replace(/\s?\/nodered-webpack\s?/, '');
		message = message.replace(/\s?\/editor-webpack\s?/, '');
		message = message.replace(/\s?stdout\s?/, '');
		message = message.replace(/[\w\d]{64}/, '');
		message = message.split('[31m').join('<span style="color:#f00">');
		message = message.split('[32m').join('<span style="color:#0f0">');
		message = message.split('[33m').join('<span style="color:#ff0">');
		message = message.split('[1m').join('<span style="font-weight:bold">');
		message = message.split('[22m').join('</span>');
		message = message.split('[39m').join('</span>');
		return message;
	}
}

