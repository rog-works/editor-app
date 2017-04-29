import * as ko from 'knockout-es5';
import EventEmitter from '../event/EventEmitter';

enum DialogTypes {
	Nortice,
	Confirm,
	Prompt
}

export type DialogEvents = 'accept' | 'cancel';
export namespace DialogEvents {
	export const Accept = 'accept';
	export const Cancel = 'cancel';
}

export default class Dialog extends EventEmitter {
	public constructor(
		public title: string = '',
		public message: string = '',
		public input: string = '',
		public confirmed: boolean = true,
		public prompted: boolean = false,
		public pos: any = { // XXX any
			'margin-top': 32 // XXX
		},
		public display: any = { // XXX any
			close: true
		}
	) {
		super(DialogEvents.Accept, DialogEvents.Cancel);
		ko.track(this);
		ko.track(this.pos);
		ko.track(this.display);
	}

	public build(): DialogBuilder {
		return new DialogBuilder(this);
	}

	public show(type: DialogTypes, title: string, message: string, input: string): void {
		const self = this;
		this.title = title;
		this.message = message;
		this.input = input;
		this.confirmed = type !== DialogTypes.Nortice;
		this.prompted = type === DialogTypes.Prompt;
		this.display.close = false;
	}

	public ok() {
		this.display.close = true;
		this.emit(DialogEvents.Accept, this, this.prompted ? this.input : true);
	}

	public cancel() {
		this.display.close = true;
		this.emit(DialogEvents.Cancel, this, false);
	}
}

class DialogBuilder {
	public constructor(
		private _owner: Dialog,
		private _title: string = '',
		private _message: string = '',
		private _input: string = ''
	) {}

	public message(message: string): this {
		this._message = message;
		return this;
	}

	public title(title: string): this {
		this._title = title;
		return this;
	}

	public input(input: string): this {
		this._input = input;
		return this;
	}

	public confirm(): void {
		this._owner.show(DialogTypes.Confirm, this._title || 'Confirm', this._message, this._input);
	}

	public nortice(): void {
		this._owner.show(DialogTypes.Nortice, this._title || 'Nortice', this._message, this._input);
	}

	public prompt(): void {
		this._owner.show(DialogTypes.Prompt, this._title || 'Prompt', this._message, this._input);
	}
}
