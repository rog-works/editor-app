import * as ko from 'knockout-es5';
import {Page} from '../ui/Page';
import {Logger, Log} from './log/Logger';
import LogLine from './log/LogLine';
import {KeyCodes} from '../ui/KeyMap';
import Http from '../net/Http';
import Path from '../io/Path';

export default class Shell extends Page implements Log {
	private _logger: Logger; // XXX

	public constructor(
		public dir: string = '/',
		public query: string = '',
		public css: string = '',
		public history: string[] = [],
		public logs: LogLine[] = []
	) {
		super();
		this._logger = new Logger(this)
		ko.track(this);
	}

	public clear(): void {
		this.logs = [];
	}

	public keyup(self: this, e: KeyboardEvent): boolean {
		switch(e.keyCode) {
		case KeyCodes.Enter:
			this._exec();
			return false;

		case KeyCodes.LUpper:
			if (e.ctrlKey && e.shiftKey) {
				this.clear();
				return false;
			}
			return true;

		default:
			return true;
		}
	}

	public _parse(query: string): [string, string] {
		let dir = this.dir;
		const matches = query.match(/^cd\s+([\d\w\-\/_.~]+);?(.*)$/);
		if (matches) {
			if (matches.length > 1) {
				if (matches[1].indexOf('~') === 0) {
					dir = Path.join('/', matches[1].substr(1));
				} else {
					dir = Path.join(dir, matches[1]);
				}
			}
			if (matches.length > 2) {
				query = matches[2].trim();
			}
		}
		return [dir, query];
	}

	public async _exec(): Promise<void> {
		const orgQuery = this.query;
		const [dir, query] = this._parse(orgQuery);
		if (query.length === 0) {
			if (this.dir !== dir) {
				this.dir = dir;
				this.query = '';
				this._logger.line(`$ ${orgQuery}`);
			}
			return;
		}
		this.dir = dir;
		this.query = '';
		this._logger.line(`$ ${orgQuery}`);
		const url = '?dir=' + encodeURIComponent(this.dir);
		await Http.post<void>(`/shell${url}`, {data: {query: query}});
		if (this.history.indexOf(orgQuery) === -1) {
			this.history.push(orgQuery);
		}
	}

	public onMessage(sender: any, event: [string, any]): boolean {
		const [tag, data] = event;
		if (tag === 'editor.shell-log') {
			this._logger.put(data.message);
		}
		return true;
	}

	public colorized(line: string): string {
		if (/^\tmodified:/.test(line) ||
			/^\tnew file:/.test(line) ||
			/^\+/.test(line)) {
			return 'fc1-p';
		} else if (/^\tdeleted:/.test(line) ||
					/^\-/.test(line)) {
			return 'fc1-e';
		} else {
			return 'fc1';
		}
	}
}
