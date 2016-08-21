'use strict';

class Dialog {
	constructor () {
		this.callback = null;
		this.title = ko.observable('');
		this.message = ko.observable('');
		this.input = ko.observable('');
		this.confirmed = ko.observable(true);
		this.prompted = ko.observable(false);
		this.pos = {
			// XXX
			'margin-top': ko.observable(32)
		};
		this.size = {
			width: ko.observable(0),
			height: ko.observable(0)
		};
		this.display = {
			close: ko.observable(true)
		};
	}

	static init (id = 'dialog') {
		const self = new Dialog();
		// ko.applyBindings(self, document.getElementById(id));
		return self;
	}

	build () {
		return new DialogBuilder(this);
	}

	show (type, title, message, input, callback) {
		this.callback = callback;
		this.title(title);
		this.message(message);
		this.input(input);
		this.confirmed(type !== 'nortice');
		this.prompted(type === 'prompt');
		this.display.close(false);
	}

	ok () {
		this.display.close(true);
		this.callback(this.prompted() ? this.input() : true);
	}

	cancel () {
		this.display.close(true);
		this.callback(false);
	}

	resize (width, height) {
		this.size.width(width);
		this.size.height(height);
	}
}

class DialogBuilder {
	constructor (owner) {
		this.owner = owner;
		this._title = '';
		this._message = '';
		this._input = '';
		this._callback = () => { console.log('Callback not found'); };
	}

	message (message) {
		this._message = message;
		return this;
	}

	title (title) {
		this._title = title;
		return this;
	}

	input (input) {
		this._input = input;
		return this;
	}

	on (callback) {
		this._callback = callback;
		return this;
	}

	confirm () {
		this.owner.show('confirm', this._title || 'Confirm', this._message, this._input, this._callback);
	}

	nortice () {
		this.owner.show('nortice', this._title || 'Nortice', this._message, this._input, this._callback);
	}

	prompt () {
		this.owner.show('prompt', this._title || 'Prompt', this._message, this._input, this._callback);
	}
}
