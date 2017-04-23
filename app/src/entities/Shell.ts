import * as fs from 'fs';
import Process from '../io/Process';
import EntryDAO from '../io/EntryDAO';

export default class Shell {
	private static readonly LOG_PATH = '/var/log/app/editor-shell.log'; // XXX fix

	public constructor(
		private _stdout: fs.WriteStream = fs.createWriteStream(Shell.LOG_PATH),
		private _options: any = { cwd: EntryDAO.rootDir } // XXX any
	) {}

	public run(command: string, args: string[], _options: any = {}): void {
		let self = this;
		let options = _options || this._options;
		(new Process(command))
			.add(args)
			.option(options)
			.on('stdout', (data: string) => self._onStdout(data))
			.on('stderr', (data: string) => self._onStderr(data))
			.run();
	}

	private _onStdout(data: string): void {
		this._stdout.write(data);
	}

	private _onStderr(data: string): void {
		this._stdout.write(data);
	}
}
