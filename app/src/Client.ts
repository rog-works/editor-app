import WS from './net/WS';
import Console from './models/Console';
import Editor from './models/Editor';
import Entry from './models/Entry';
import Shell from './models/Shell';
import Weblog from './models/Weblog';
import Hex from './models/Hex';
import Dialog from './models/Dialog';
import Node from './lib/Node';

export default class Application extends Node {
	private static _instance: Application;

	private constructor(
		private ws = new WS(),
		private console = new Console(),
		private editor = new Editor(),
		private entry = new Entry(),
		private shell = new Shell(),
		private weblog = new Weblog(),
		private hex = new Hex(),
		private dialog = new Dialog()
	) {
		super();
	}
	
	public static get instance(): Application {
		return this._instance || (this._instance = new this());
	}

	public static init(): void {
		window.onload = () => this._instance._bind();
	}

	private _bind(): void {
		try {
			console.log('On load started');
			this._depended();
			this._init();
			console.log('On load finished');
		} catch (error) {
			console.error(error.message, error.stack);
		}
	}

	private _depended(): void {
		// extend ko
		KoPlugin.bind();
	}

	private _init(): void {
		// bind events
		this.on('updateEntry', this.updateEntry);
		this.on('beforeReload', this.beforeReload);
		this.on('afterReload', this.afterReload);
		this.on('shownCreate', this.shownCreateAsync);
		this.on('shownRename', this.shownRenameAsync);
		this.on('shownDelete', this.shownDeleteAsync);

		// bind pages
		for (const page of this._pages()) {
			this.addNode(page);
		}

		// first view on entry
		this.focus('entry');
	}

	private _pages(): Node[] {
		return [
			this.entry,
			this.editor,
			this.shell,
			this.weblog,
			this.console,
			this.hex
		];
	}

	public focus(pageName: string): boolean {
		for(const page of this._pages()) {
			if (page.display.active()) {
				page.activate(false);
				break;
			}
		}
		if (pageName in this) {
			this[pageName].activate(true); // FIXME
		}
		return false;
	}

	public beforeReload(isText: boolean): boolean {
		if (isText) {
			this.editor.beforeLoad();
		} else {
			this.hex.beforeLoad();
		}
	}

	public afterReload(path: string, isText: boolean, content: string): boolean {
		if (isText) {
			this.editor.load(path, content);
			this.editor.focus();
			this.focus('editor');
		} else {
			this.hex.load(path, content);
			this.hex.focus();
			this.focus('hex');
		}
		return false;
	}

	public async updateEntry(path: string, content: string): Promise<boolean> {
		if (!this.entry.has(path)) {
			throw new Error(`No such file or diretory. ${path}`);
		}
		const entry = this.entry.at(path);
		const updated = await this.entry.at(path).update(content);
		this.editor.saved(updated);
		return false;
	}

	public shownCreate(): Promise<boolean> {
		return await this._showPrompt('Input create file path', '/');
	}

	public async shownRename(path: string): Promise<boolean> {
		return await this._showPrompt('Change file path', path);
	}

	public async shownDelete(path: string): Promise<boolean> {
		return await this._showConfirm(`'${path}' deleted?`);
	}

	private async _showConfirm(message: string): Promise<boolean> {
		return await this.dialog.build().message(message).confirm();
	}

	private async _showPrompt(message: string, input: string): Promise<boolean> {
		return await this.dialog.build().message(message).input(input).prompt();
	}
	

	public async test(): void {
		const path = '/app/docs/schema.json';
		const entry = this.entry.at(path);
		if (entry.content.length === 0) {
			return;
		}
		try {
			const url = '/' + encodeURIComponent(path);
			const entity = await EntryItem.send(url);
			const schema = JSON.parse(entity.content);
			const root = 'this["0xAE426082"](a,b) || 2';//schema.$.signature._type;
			const parser = new TokenParser(new TextStream(root));
			const results = parser.execute();
			console.log('TOKEN:', results);
			const expParser = new ExpressionParser(new ArrayStream(results));
			const expression = expParser.execute();
			console.log('EXP:', expression);
		} catch (error) {
			console.error(error.message, error.stack);
		}
	}
}
