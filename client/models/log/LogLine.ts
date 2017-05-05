import * as ko from 'knockout-es5';

export default class LogLine {
	public constructor(
		public readonly text: string,
		public readonly color: string,
		public separated: boolean,
		public css: any = {},
		public closed: boolean = false
	) {
		this.css = {[color]: true};
		ko.track(this);
		ko.track(this.css);
	}

	public expand() {
		this.closed = !this.closed;
	}
}
