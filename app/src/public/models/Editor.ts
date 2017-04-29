import * as ko from 'knockout-es5';
// import * as ace from 'ace'; XXX import nessesory
import {default as Page, States} from '../components/Page';
import Path from '../io/Path';
import {KeyCodes} from '../ui/KeyMap';

export type EditorEvents = 'updateEntry';
export namespace EditorEvents {
	export const UpdateEntry = 'updateEntry';
}

export default class Editor extends Page {
	public constructor(
		public path: string = '#',
		public state: States = States.Syncronized
	) {
		super();
		this.load();
		this._editor().on('change', this.changed.bind(this));
		ko.track(this);
		ko.track(this.icon);
	}

	public load(path: string = '#', content: string = ''): void {
		const ext = Path.extention(path);
		const config = this._configure(ext);
		const editor = this._editor();
		const session = editor.getSession();
		this._transition(States.Loading);
		this.path = path;
		session.setValue(content);
		session.setTabSize(config.tabs);
		session.setUseSoftTabs(config.softTabs);
		session.setMode(this._toMode(config.mode));
		this._transition(States.Syncronized);
	}

	// XXX Ace editor auto resizing??
	// resize (width, height) {
	// 	this._editor().resize();
	// }

	public focus() {
		this._editor().focus();
	}

	public keydown(self: this, e: KeyboardEvent): boolean {
		if (e.ctrlKey || e.metaKey) {
			// handling ctrl + s
			if (e.keyCode === KeyCodes.S) {
				this.save();
				return false;
			// FIXME
			} else if ([KeyCodes.R, KeyCodes.W].indexOf(e.keyCode) !== -1) {
				return false;
			}
		}
		return true;
	}

	public save(): void {
		this._transition(States.Loading);
		this.fire(EditorEvents.UpdateEntry, this.path, this._content());
	}

	public saved(updated: boolean): void {
		this._transition(updated ? States.Syncronized : States.Modified);
	}

	public changed(): void {
		if (this.state === States.Syncronized) {
			this._transition(States.Modified);
		}
	}
	
	public cursor(key: string): void {
		switch (key) {
		case 'left': // XXX magic string
			this._editor().navigateLeft(1);
			break;
		case 'right':
			this._editor().navigateRight(1);
			break;
		}
	}

	public beforeLoad(): void {
		this._transition(States.Loading);
	}

	// @override
	protected _transition(state: States): void {
		super._transition(state);
		this.state = state;
	}

	private _content(): string {
		return this._editor().getSession().getValue();
	}

	private _configure(extention: string): any {
		const config: any = { // XXX any
			sh: {mode: 'sh', tabs: 4, softTabs: false},
			py: {mode: 'python', tabs: 4, softTabs: false},
			php: {mode: 'php', tabs: 4, softTabs: false},
			css: {mode: 'css', tabs: 4, softTabs: false},
			html: {mode: 'html', tabs: 4, softTabs: false},
			json: {mode: 'json', tabs: 4, softTabs: false},
			js: {mode: 'javascript', tabs: 4, softTabs: false},
			ts: {mode: 'typescript', tabs: 4, softTabs: false},
			rb: {mode: 'ruby', tabs: 2, softTabs: true},
			yml: {mode: 'yaml', tabs: 2, softTabs: true},
			yaml: {mode: 'yaml', tabs: 2, softTabs: true}
		};
		return (extention in config) ? config[extention] : config.sh;
	}

	private _editor(): AceAjax.Editor {
		return ace.edit('editor');
	}

	private _toMode(mode: string): string {
		return `ace/mode/${mode}`;
	}
}
