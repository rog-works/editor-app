import WS from './net/WS';
import Console from './models/Console';
import {Editor, EditorEvents} from './models/Editor';
import {Entry, EntryItem, EntryEvents} from './models/Entry';
import Shell from './models/Shell';
import Weblog from './models/Weblog';
// import Hex from './models/Hex';
import Dialog from './models/Dialog';
import {Page} from './ui/Page';
import EventEmitter from './event/EventEmitter';
import KoPlugin from './components/KoPlugin';

export default class Application extends EventEmitter {
	private static _instance: Application;

	private constructor(
		public ws = new WS('ws://localhost:24224'),
		public console = new Console(),
		public editor = new Editor(),
		public entry = new Entry(),
		public shell = new Shell(),
		public weblog = new Weblog(),
		// public hex = new Hex(),
		public dialog = new Dialog()
	) {
		super([]);
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
		this.on(EditorEvents.Saved, this._onSaved);
		this.on(EntryEvents.BeforeLoaded, this._onBeforeLoaded);
		this.on(EntryEvents.AfterLoaded, this._onAfterLoaded);
		this.on(shownCreate, this.shownCreateAsync);
		this.on(shownRename, this.shownRenameAsync);
		this.on(shownDelete, this.shownDeleteAsync);

		// first view on entry
		this.focus('entry');
	}

	public focus(pageName: string): boolean {
		for(const key of Object.keys(this)) {
			const prop = (<any>this)[key];
			if ('activate' in prop) {
				prop.activate(false);
				break;
			}
		}
		if (pageName in this) {
			(<any>this)[pageName].activate(true); // FIXME
		}
		return false;
	}

	private _onBeforeLoaded(sender: EntryItem): boolean {
		if (sender.isText) {
			this.editor.beforeLoad();
		} else {
			// this.hex.beforeLoad(); // FIXME
		}
		return false;
	}

	private _onAfterLoaded(sender: EntryItem): boolean {
		if (sender.isText) {
			this.editor.load(sender.path, sender.content);
			this.editor.focus();
			this.focus('editor');
		} else {
			// this.hex.load(sender.path, sender.content); // FIXME
			// this.hex.focus();
			// this.focus('hex');
		}
		return false;
	}

	public async _onSaved(sender: Editor): Promise<boolean> {
		if (!this.entry.has(sender.path)) {
			throw new Error(`No such file or diretory. ${sender.path}`);
		}
		const entry = this.entry.at(sender.path);
		const updated = await entry.update(sender.content);
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
	

	public test(): void {
		// XXX
		// const path = '/app/docs/schema.json';
		// const entry = this.entry.at(path);
		// if (entry.content.length === 0) {
		// 	return;
		// }
		// try {
		// 	const url = '/' + encodeURIComponent(path);
		// 	const entity = await EntryItem.send(url);
		// 	const schema = JSON.parse(entity.content);
		// 	const root = 'this["0xAE426082"](a,b) || 2';//schema.$.signature._type;
		// 	const parser = new TokenParser(new TextStream(root));
		// 	const results = parser.execute();
		// 	console.log('TOKEN:', results);
		// 	const expParser = new ExpressionParser(new ArrayStream(results));
		// 	const expression = expParser.execute();
		// 	console.log('EXP:', expression);
		// } catch (error) {
		// 	console.error(error.message, error.stack);
		// }
	}
}
