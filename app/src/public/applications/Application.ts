import * as ko from 'knockout-es5';
import WS from '../net/WS';
import Console from '../models/Console';
import {Editor, EditorEvents} from '../models/Editor';
import {Entry, EntryItem, EntryEvents} from '../models/Entry';
import Shell from '../models/Shell';
import Weblog from '../models/Weblog';
// import Hex from './models/Hex';
import {Dialog, DialogEvents} from '../models/Dialog';
import {Page} from '../ui/Page';
import EventEmitter from '../event/EventEmitter';
import KoPlugin from '../components/KoPlugin';

enum BehaviorTypes {
	Create,
	Rename,
	Delete
}

export default class Application extends EventEmitter {
	private static _instance: Application;

	private constructor(
		public ws = new WS('ws://localhost:18082'),
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

	public static run(): void {
		window.onload = () => this.instance._init();
	}

	private _init(): void {
		try {
			console.log('On load started');
			this._depended();
			this._bind();
			console.log('On load finished');
		} catch (error) {
			console.error(error.message, error.stack);
		}
	}

	private _depended(): void {
		// extend ko
		KoPlugin.bind();
	}

	private _bind(): void {
		// bind events
		this.editor.on(EditorEvents.Saved, this._onSaved.bind(this));
		this.entry.on(EntryEvents.BeforeLoaded, this._onBeforeLoaded.bind(this));
		this.entry.on(EntryEvents.AfterLoaded, this._onAfterLoaded.bind(this));
		this.dialog.on(DialogEvents.Accepted, this._onAccepted.bind(this));
		this.dialog.on(DialogEvents.Canceled, this._onCanceled.bind(this));

		// first view on entry
		this.focus('entry');

		// bindings
		ko.applyBindings(this);
	}

	public focus(pageName: string): boolean {
		for(const key of Object.keys(this)) {
			const prop = (<any>this)[key];
			if (('activate' in prop) && prop.display.active) {
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

	private _onSaved(sender: Editor): boolean {
		this._saved(sender.path, sender.content);
		return false;
	}

	private async _saved(path: string, content: string): Promise<void> {
		const entry = this.entry.at(path);
		if (entry === null) {
			throw new Error(`No such file or diretory. ${path}`);
		}
		const updated = await entry.update(content);
		this.editor.saved(updated);
	}

	private _onAccepted(sender: Dialog, result: any): boolean {
		switch (sender.context.behavior) {
		case BehaviorTypes.Create: this.entry.new(<string>result); break;
		case BehaviorTypes.Rename: (sender.context.item as EntryItem).rename(<string>result); break;
		case BehaviorTypes.Delete: this.entry.remove(sender.context.item as EntryItem); break;
		}
		return false;
	}

	private _onCanceled(sender: Dialog): boolean {
		console.log(`cancel ${sender.context.behavior}`);
		return false;
	}

	public shownCreate(): void {
		this.dialog.build()
			.context({behavior: BehaviorTypes.Create})
			.message('Input create file path')
			.input('/')
			.prompt();
	}

	public shownRename(entry: EntryItem): void {
		this.dialog.build()
			.context({item: entry, behavior: BehaviorTypes.Rename})
			.message('Change file path')
			.input(entry.path)
			.prompt();
	}

	public shownDelete(entry: EntryItem): void {
		this.dialog.build()
			.context({item: entry, behavior: BehaviorTypes.Delete})
			.message(`'${entry.path}' deleted?`)
			.confirm();
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
