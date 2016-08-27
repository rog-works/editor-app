'use strict';

class Page {
	constructor (width = 0, height = 0) {
		// XXX
		// this.size = ko.observable({
		// 	width: width,
		// 	height: height
		// });
		this.size = ko.observable({ width: width });
		this.display = {
			'active': ko.observable(false)
		};
		this.icon = {
			'fa-reflesh': ko.observable(false),
			'fa-spin': ko.observable(false)
		};
	}
	
	resize (width, height) {
		// XXX
		this.size({width: width});
	}
	
	selected (activate) {
		this.display.active = activate;
	}
}
