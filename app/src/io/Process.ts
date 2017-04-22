import {exec} from 'child_process';

export default class ProcessProvider {
	public constructor(
		private _command: string,
		private _args: string[] = [],
		private _options: any = {},
		private _handlers: any = {}
	) {
		this._handlers = {
			// stdin: this.stdin,
			stdout: this._stdout,
			stderr: this._stderr
		};
	}

	public add(arg: string | string[], available: boolean = true): this {
		if (available) {
			if (Array.isArray(arg)) {
				for (const a of arg) {
					this._args.push(a);
				}
			} else {
				this._args.push(arg);
			}
		}
		return this;
	}

	public option(options: any): this {
		this._options = options;
		return this;
	}

	public on(tag: string, handler: Function): this {
		this._handlers[tag] = handler;
		return this;
	}

	private _stdout(data: any): void {
		console.log(data);
	}

	private _stderr(data: any): void {
		console.log(data);
	}

	public run(): boolean {
		console.log('executed', this._command, this._args);
		const query = `${this._command} ${this._args.join(' ')}`;
		const child = exec(query, this._options);
		child.stdout.on('data', this._handlers.stdout);
		child.stderr.on('data', this._handlers.stderr);
		return true;
	}
}

module.exports = ProcessProvider;
