import * as ko from 'knockout-es5';
import EventEmitter from '../event/EventEmitter';

enum DialogTypes {
	Nortice,
	Confirm,
	Prompt
}

export type DialogEvents = 'accepted' | 'canceled';
export namespace DialogEvents {
	export const Accepted = 'accepted';
	export const Canceled = 'canceled';
}

export class Dialog extends EventEmitter {
	public constructor(
		public title: string = '',
		public message: string = '',
		public input: string = '',
		public context: any = {}, // XXX
		public confirmed: boolean = true,
		public prompted: boolean = false,
		public pos: any = { // XXX any
			'margin-top': 32 // XXX
		},
		public display: any = { // XXX any
			close: true
		}
	) {
		super([DialogEvents.Accepted, DialogEvents.Canceled]);
		ko.track(this);
		ko.track(this.pos);
		ko.track(this.display);
	}

	public build(): DialogBuilder {
		return new DialogBuilder(this);
	}

	public show(type: DialogTypes, title: string, message: string, input: string, context: any = {}): void {
		const self = this;
		this.title = title;
		this.message = message;
		this.input = input;
		this.confirmed = type !== DialogTypes.Nortice;
		this.prompted = type === DialogTypes.Prompt;
		this.display.close = false;
		this.context = context;
	}

	public ok() {
		this.display.close = true;
		this.emit(DialogEvents.Accepted, this, this.prompted ? this.input : true);
	}

	public cancel() {
		this.display.close = true;
		this.emit(DialogEvents.Canceled, this);
	}
}

class DialogBuilder {
	public constructor(
		private _owner: Dialog,
		private _title: string = '',
		private _message: string = '',
		private _input: string = '',
		private _context: any = {}
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

	public context(context: any): this {
		this._context = context;
		return this;
	}

	public confirm(): void {
		this._owner.show(
			DialogTypes.Confirm,
			this._title || 'Confirm',
			this._message,
			this._input,
			this._context
		);
	}

	public nortice(): void {
		this._owner.show(
			DialogTypes.Nortice,
			this._title || 'Nortice',
			this._message,
			this._input,
			this._context
		);
	}

	public prompt(): void {
		this._owner.show(
			DialogTypes.Prompt,
			this._title || 'Prompt',
			this._message,
			this._input,
			this._context
		);
	}
}
