import Storage from '../io/Storage';
import * as Path from 'path';

export default class Entry {
	public path: string;
	public isFile: boolean;
	public isText: boolean;
	public content: string | Buffer;
	public constructor(realPath: string, isFile: boolean, content: string) {
		const relPath = Entry._toRelativePath(realPath);
		const isText = Entry._isText(Path.basename(relPath));
		this.path = relPath;
		this.isFile = isFile;
		this.isText = isText;
		this.content = content;
		if (isFile && content.length > 0) {
			if (isText) {
				this.content = content.toString();
			} else {
				this.content = Entry._toHex(content);
			}
		}
	}

	public static keys(): string[] {
		return ['path', 'isFile', 'isText', 'content'];
	}

	public static async entries(relDirPath: string = ''): Promise<Entry[]> {
		const realDirPath = this._toRealPath(relDirPath);
		return (await Storage.entries(realDirPath, false))
			.map((entity) => {
				const relPath = this._toRelativePath(entity);
				const isFile = this._isFile(entity);
				return new this(entity, isFile, '');
			});
	}

	public static async at(relPath: string): Promise<Entry> {
		const realPath = this._toRealPath(relPath);
		const isFile = this._isFile(realPath);
		if (isFile) {
			return new this(realPath, isFile, await Storage.at(realPath));
		} else {
			return new this(realPath, isFile, '');
		}
	}

	public static async create(relPath: string): Promise<boolean> {
		return await Storage.create(this._toRealPath(relPath));
	}

	public static async update(relPath: string, content: string): Promise<boolean> {
		const realPath = this._toRealPath(relPath);
		return await Storage.update(realPath, content);
	}

	public static async rename(relPath: string, relToPath: string): Promise<boolean> {
		return await Storage.rename(this._toRealPath(relPath), this._toRealPath(relToPath));
	}

	public static async destroy(relPath: string): Promise<boolean> {
		return await Storage.remove(this._toRealPath(relPath));
	}

	public static _isFile(realPath: string): boolean {
		return Storage.isFile(realPath);
	}

	public static _toRealPath(relPath: string): string {
		return `${Storage.rootDir()}${relPath}`;
	}

	public static _toRelativePath(realPath: string): string {
		return realPath.substr(Storage.rootDir().length); // XXX inaccuracy
	}

	public static _toHex(content: string): Buffer {
		return new Buffer(content, 'utf8');
	}

	public static _isText(name: string): boolean {
		// equal file name
		const names = [
			'Vagrantfile',
			'Dockerfile'
		];
		if(names.indexOf(name) !== -1) {
			return true;
		}
		// with extension
		return [
			// script
			'.js',
			'.jsx',
			'.ts',
			'.tsx',
			'.php',
			'.rb',
			'.py',
			'.sh',
			// document
			'.txt',
			'.html',
			'.md',
			// data
			'.css',
			'.yml',
			'.yaml',
			'.json',
			'.conf',
			'.cnf',
			'.sql',
			'.log'
		].indexOf(Path.extname(name)) !== -1;
	}
}
