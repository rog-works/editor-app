import EntryDAO from '../io/EntryDAO';
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

	public static entries(relDirPath: string = ''): Entry[] {
		const realDirPath = this._toRealPath(relDirPath);
		return EntryDAO.entries(realDirPath, false)
			.map((entity) => {
				const relPath = this._toRelativePath(entity);
				const isFile = this._isFile(entity);
				return new this(entity, isFile, '');
			});
	}

	public static at(relPath: string): Entry {
		const realPath = this._toRealPath(relPath);
		const isFile = this._isFile(realPath);
		if (isFile) {
			return new this(realPath, isFile, EntryDAO.at(realPath));
		} else {
			return new this(realPath, isFile, '');
		}
	}

	public static create(relPath: string): void {
		EntryDAO.create(this._toRealPath(relPath));
	}

	public static update(relPath: string, content: string): void {
		const realPath = this._toRealPath(relPath);
		EntryDAO.update(realPath, content);
	}

	public static rename(relPath: string, relToPath: string): void {
		EntryDAO.rename(this._toRealPath(relPath), this._toRealPath(relToPath));
	}

	public static destroy(relPath: string): void {
		EntryDAO.remove(this._toRealPath(relPath));
	}

	public static _isFile(realPath: string): boolean {
		return EntryDAO.isFile(realPath);
	}

	public static _toRealPath(relPath: string): string {
		return `${EntryDAO.rootDir()}${relPath}`;
	}

	public static _toRelativePath(realPath: string): string {
		return realPath.substr(EntryDAO.rootDir().length); // XXX inaccuracy
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
