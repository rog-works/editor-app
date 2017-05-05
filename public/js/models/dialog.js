'use strict';

class Dialog {
	constructor () {
		this.title = ko.observable('');
		this.message = ko.observable('');
		this.input = ko.observable('');
		this.confirmed = ko.observable(true);
		this.prompted = ko.observable(false);
		this.resolve = null;
		this.reject = null;
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

	show (type, title, message, input) {
		const self = this;
		this.title(title);
		this.message(message);
		this.input(input);
		this.confirmed(type !== 'nortice');
		this.prompted(type === 'prompt');
		this.display.close(false);
		return new Promise((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
	}

	ok () {
		this.display.close(true);
		this.resolve(this.prompted() ? this.input() : true);
	}

	cancel () {
		this.display.close(true);
		this.resolve(false);
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

	confirm () {
		return this.owner.show('confirm', this._title || 'Confirm', this._message, this._input);
	}

	nortice () {
		return this.owner.show('nortice', this._title || 'Nortice', this._message, this._input);
	}

	prompt () {
		return this.owner.show('prompt', this._title || 'Prompt', this._message, this._input);
	}
}
