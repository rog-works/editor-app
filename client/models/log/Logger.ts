import LogLine from './LogLine';

export interface Log {
	logs: LogLine[];
	colorized: (message: string) => string
}

export class Logger {
	public constructor(
		private _owner: Log
	) {}

	public put(message: string): void {
		this._push(message, false);
	}

	public line(message: string): void {
		this._push(message, true);
	}

	public _push(message: string, separated: boolean): void {
		// console.log(log, separated);
		this._owner.logs.push(new LogLine(message, this._owner.colorized(message) || 'fc1', separated));
	}
}
