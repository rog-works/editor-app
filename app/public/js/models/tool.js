'use strict';

class Tool {
	constructor () {
		this.page = ko.observable('entry');
	}

	static init (id = 'tool') {
		const self = new Tool();
		// ko.applyBindings(self, document.getElementById(id));
		return self;
	}

	activate (page) {
		this.page(page);
		APP.pages().forEach((page) => {
			if (page.display.active()) {
				page.selected(false);
			}
		});
		if (page in APP) {
			APP[page].selected(true);
		}
	}
}
