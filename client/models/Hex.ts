import {Page, States, Icons} from '../ui/Page';
import {KeyCodes} from '../ui/KeyMap';

class Hex extends Page {
	public constructor() {
		super();
		// state
		this.path = '#';
		this.rows = HexRows.mixin([]);
		this.editor = new HexEditor();
		this.focused = false;
		ko.track(this);
	}

	// @override
	public syncronizedIcon(): Icons {
		return Icons.Hex;
	}

	public load(path: string = '#', content: string = ''): void {
		try {
			const stream = new TextStream(content);
			this._transition(States.Loading);
			this.path = path;
			this.rows.load(stream);
			this.editor.load(stream);
			this._transition(States.Syncronized);
		} catch (error) {
			console.error(error);
		}
	}

	public focus(): void {
		console.log('On focus', this.focused);
		this.focused = true;
	}

	public keydown(self: this, e: KeyboardEvent): boolean {
		console.log('On keydown', e.keyCode, e.ctrlKey, e.shiftKey);
		if (!this.editor.onKeydown(e.keyCode, e.ctrlKey, e.shiftKey)) {
			this.rows.changed();
			return false;
		} else {
			return true;
		}
	}

	public copy(self: this, e: any): boolean { // FIXME
		console.log('On copy');
		return this.editor.onCopy(e.originalEvent.clipboardData);
	}

	public cut(self: this, e: any): boolean { // FIXME
		console.log('On cut');
		return this.editor.onCut(e.originalEvent.clipboardData);
	}

	public paste(self: this, e: any): boolean { // FIXME
		console.log('On paste');
		return this.editor.onPaste(e.originalEvent.clipboardData);
	}

	public scroll(self: this, e: ScrollEvent): boolean {
		this.rows.scrollY(e.target.scrollTop);
		return true;
	}

	public save(): void {
		this._transition(States.Loading);
		this.emit(HexEvents.UpdateEntry, this.path, this.rows.stream.source);
	}

	public saved(updated: boolean): void {
		this._transition(updated ? States.Syncronized : States.Modified);
	}

	public changed(): void {
		if (this.state === States.Syncronized) {
			this._transition(States.Modified);
		}
	}

	public beforeLoad(): void {
		this._transition(States.Loading);
	}

	protected _transition (state) {
		super._transition(state);
		this.state = state;
	}
}

class HexRows {
	public static readonly ROW_SIZE_H = 16; // XXX

	public constructor(
		private _localPos: number = 0,
		private _globalPos: number = 0,
		private _stream: Stream = new TextStream(),
		public position: any = {
			top: 0
		},
		public globalSize = { // XXX
			width: 360,
			height: 640
		}
	) {
		ko.track(this);
		ko.track(this.position);
		ko.track(this.globalSize);
	}

	public static mixin(obj): any { // XXX any
		const self = new HexRows();
		for (const key in self) {
			if (self.hasOwnProperty(key)) {
				obj[key] = self[key];
			}
		}
		// XXX
		[
			'hexAt',
			'toGlobalPos',
			'toByteOfGlobalPos',
			'load',
			'clear',
			'resize',
			'changed',
			'scrollY',
			'moveRow'
		].forEach((key) => {
			obj[key] = self[key].bind(obj);
		});
		return obj;
	}

	public hexAt(localPos: number): string {
		this._stream.seek(this.toGlobalPos(localPos), 'begin');
		if (this._stream.isInside(1)) {
			return this._stream.read(1).toUpperCase();
		} else {
			return '-';
		}
	}

	public toGlobalPos(localPos: number): number {
		return (HexUtil.toRowPos(this._globalPos) * 32) + localPos;
	}

	// XXX
	public toByteOfGlobalPos(localPos: number): number {
		return this._globalPos + localPos;
	}

	public load(stream: Stream): void {
		this._globalPos = 0;
		this._stream = stream;
		this.position.top = 0;
	}

	public clear(): void {
		while (this.pop()) {}
	}

	public resize (width: number, height: number): void { // FIXME
		// resize
		this.size.width = width;
		this.size.height = height;
		const globalRowNum = ~~((this._stream.length + 31) / 32);
		this.globalSize.width = width;
		this.globalSize.height(globalRowNum * HexRows.ROW_SIZE_H);

		// reallocate
		const rows = this();
		const localRowNum = Math.min(~~(height / HexRows.ROW_SIZE_H), globalRowNum);
		const diffRowNum = localRowNum - rows.length;
		if (diffRowNum > 0) {
			const beforeRowPos = rows.length;
			for (let i = 0; i < diffRowNum; i += 1) {
				this.push(new HexRow(this, beforeRowPos + i));
			}
		} else if (diffRowNum < 0) {
			for (let i = 0; i < Math.abs(diffRowNum); i += 1) {
				this.pop();
			}
		}

		// reindex
		this.moveRow(HexUtil.toRowPos(this._globalPos));
	}

	public changed(): void {
		this.moveRow(HexUtil.toRowPos(this._globalPos));
	}

	public scrollY(posY): void {
		const globalRowPos = HexUtil.toRowPos(posY);
		this.position.top = posY;
		this.moveRow(globalRowPos);
	}

	public moveRow(globalRowPos: number): void {
		const diffRowPos = globalRowPos - HexUtil.toRowPos(this._globalPos);
		this._globalPos = HexUtil.toPos(globalRowPos);

		// sorted rows
		if (diffRowPos !== 0) {
			const rows = this();
			for (const row of rows) {
				row.localRowPos = (row.localRowPos + rows.length - diffRowPos) % rows.length;
			}
			this.sort((a, b) => a.localRowPos - b.localRowPos);
		}

		// reindex
		for (const row of this()) {
			row.update();
		}
	}
}

class HexRow {
	public constructor(
		private _rows: HexRows, // XXX parent rename
		localRowPos: number,
		private _localPos: number = 0,
		public columns = [],
		public address: string = '',
		public text: string = ''
	) {
		this._localPos = HexUtil.toPos(localRowPos);
		ko.track(this);
		this.load();
	}

	public get rows(): HexRows {
		return this._rows;
	}

	public get localPos(): number {
		return this._localPos;
	}

	public get localRowPos(): number {
		return HexUtil.toRowPos(this._localPos);
	}

	public set localRowPos(value: number) {
		this._localPos = HexUtil.toPos(value);
	} 

	public hexAt(x: number): Hex {
		return this._rows.hexAt(this.toLocalPos(x));
	}

	public toLocalPos(x: number): number {
		return (this.localRowPos * 32) + x;
	}

	public toGlobalPos(x: number): number {
		return this._rows.toGlobalPos(this.toLocalPos(x));
	}

	public load() {
		for (let x = 0; x < 32; x += 1) {
			this.columns.push(new HexColumn(this, x));
		}
		this.address(HexUtil.toAddress(this._rows.toByteOfGlobalPos(this._localPos)));
		this.text(HexUtil.byteToStr(this._bytes()));
	}

	public update(): void {
		for (const column of this.columns) {
			column.update();
		}
		this.address(HexUtil.toAddress(this._rows.toByteOfGlobalPos(this._localPos)));
		this.text(HexUtil.byteToStr(this._bytes()));
	}

	public _bytes(): string[] {
		let bytes = [];
		for (let x = 0; x < 16; x += 1) {
			const columnH = this.columns[x * 2 + 0]; // FIXME
			const columnL = this.columns[x * 2 + 1];
			if (!columnH.available) {
				break;
			}
			bytes.push((columnH.value << 4) | columnL.value);
		}
		return bytes;
	}
}

export class HexColumn {
	public constructor(
		private _row: number,
		private _posX: number,
		private _value: number | null = null, // XXX nullable
		public hex: string = '-',
		public css: any = {}, // XXX any
		public globalPos: number = 0
	) {
		ko.track(this);
	}

	public get value(): number { // FIXME type
		return this._value;
	}

	public get available(): boolean {
		return this._value !== null;
	}

	public update(): void {
		const hex = this._row.hexAt(this._posX);
		if (this.hex !== hex) {
			this.hex = hex;
			this._value = hex !== '-' ? HexUtil.toByte(hex) : null;
		}
		// XXX
		this.globalPos = this._row.toGlobalPos(this._posX);
	}
}

class HexUtil {
	public static toAddress(value: number): string {
		return `00000000${value.toString(16).toUpperCase()}`.slice(-8);
	}

	public static toRowPos(pos: number): number {
		return ~~(pos / 16);
	}

	public static toPos(rowPos: number): number {
		return rowPos * 16;
	}

	public static toHex(byte: number): string {
		return `00${byte.toString(16).toUpperCase()}`.slice(-2);
	}

	public static toByte(hex: string): number {
		return parseInt(hex, 16);
	}

	public static toText(hexBytes: string): string {
		const bytes = HexUtil.hexToBytes(hexBytes);
		return HexUtil.byteToStr(bytes);
	}

	static hexToBytes (hexBytes: string): number[] {
		const bytes: number[] = [];
		for (const i = 0; i < hexBytes.length; i += 2) {
			bytes.push(HexUtil.toByte(hexBytes.substr(i, 2)));
		}
		return bytes;
	}

	public static byteToStr(bytes: number[], encode: string = 'UTF8'): string {
		return HexUtil[`byteToStr${encode}`](bytes);
	}

	// XXX
	public static byteToStrSJIS (bytes) {
		let str = '';
		for (let i = 0; i < bytes.length; i += 1) {
			const byte = HexUtil._readByte(bytes, i);
			if (byte <= 0x7f) {
				str += String.fromCharCode(byte);
			} else {
				const chara = (HexUtil._readByte(i + 1) << 8) | byte;
				str += String.fromCharCode(chara);
				i += 1;
			}
		}
		return str;
	}

	static byteToStrUTF8 (bytes) {
		let str = '';
		for (let i = 0; i < bytes.length; i += 1) {
			const byte = HexUtil._readByte(bytes, i);
			if (byte <= 0x7f) {
				str += String.fromCharCode(byte);
			} else if (byte <= 0xdf) {
				let chara = ((byte & 0x1f) << 6);
				chara += (HexUtil._readByte(i + 1) & 0x3f);
				str += String.fromCharCode(chara);
				i += 1;
			} else if (i <= 0xe0) {
				let chara = 0x800 | ((HexUtil._readByte(i + 1) & 0x1f) << 6);
				chara += (HexUtil._readByte(i + 2) & 0x3f);
				str += String.fromCharCode(chara);
				i += 2;
			} else {
				let chara = ((byte & 0x0f) << 12);
				chara += ((HexUtil._readByte(i + 1) & 0x3f) << 6);
				chara += (HexUtil._readByte(i + 2) & 0x3f);
				str += String.fromCharCode(chara);
				i += 2;
			}
		}
		return str;
	}

	static _readByte (bytes, offset) {
		return bytes.length > offset ? bytes[offset] : 0;
	}
}
