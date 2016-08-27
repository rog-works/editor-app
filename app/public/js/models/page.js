'use strict';

class Page {
	constructor (width = 0, height = 0) {
		this.STATE_LOADING = 'loading';

		// XXX
		// this.size = ko.observable({
		// 	width: width,
		// 	height: height
		// });
		this.size = ko.observable({ width: width });
		this.display = {
			active: ko.observable(false)
		};
		this.icon = {
			'fa-refresh': ko.observable(false),
			'fa-spin': ko.observable(false)
		};
	}
	
	resize (width, height) {
		// XXX
		this.size({width: width});
	}
	
	selected (activate) {
		this.display.active(activate);
	}

	_transition (state) {
		for (const key in this.icon) {
			this.icon[key](false);
		}
		if (state === this.STATE_LOADING) {
			this.icon['fa-refresh'](true);
			this.icon['fa-spin'](true);
		}
	}
}
