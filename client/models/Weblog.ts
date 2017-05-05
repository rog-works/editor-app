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
		return this._colorify(lines.join(' '));
	}

	public colorized(message: string): string {
		return '';
	}

	public _colorify(message: string): string {
		message = message.replace(/\s?\/nodered-webpack\s?/, '');
		message = message.replace(/\s?\/editor-webpack\s?/, '');
		message = message.replace(/\s?stdout\s?/, '');
		message = message.replace(/[\w\d]{64}/, '');
		message = message.split(EscapeCodes.ColorRed).join('<span style="color:#f00">');
		message = message.split(EscapeCodes.ColorGreen).join('<span style="color:#0f0">');
		message = message.split(EscapeCodes.ColorYellow).join('<span style="color:#ff0">');
		message = message.split(EscapeCodes.Bold).join('<span style="font-weight:bold">');
		message = message.split(EscapeCodes.BoldEnd).join('</span>');
		message = message.split(EscapeCodes.ColorEnd).join('</span>');
		message = message.split(EscapeCodes.Escape).join('');
		message = message.split(EscapeCodes.BackSpace).join('');
		return message;
	}
}

type EscapeCodes = '\u001B'
	| '\b'
	| '[1m'
	| '[22m'
	| '[31m'
	| '[32m'
	| '[33m'
	| '[39m'

namespace EscapeCodes {
	export const Escape = '\u001B';
	export const BackSpace = '\b';
	export const Bold = '[1m';
	export const BoldEnd = '[22m';
	export const ColorRed = '[31m';
	export const ColorGreen = '[32m';
	export const ColorYellow = '[33m';
	export const ColorEnd = '[39m';
}