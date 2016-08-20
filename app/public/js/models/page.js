'use strict';

class Page {
	constructor (width = 0, height = 0) {
		// XXX
		// this.size = ko.observable({
		// 	width: width,
		// 	height: height
		// });
		this.size = ko.observable({ width: width });
	}
	
	resize (width, height) {
		// XXX
		this.size({width: width});
	}
}
