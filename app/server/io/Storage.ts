import * as fs from 'fs';
import * as Path from 'path';
import * as glob from 'glob';
import {exec} from 'child_process';

export default class Storage {
	private static _async<T>(func: Function, ...args: any[]): Promise<T> {
		return new Promise((resolve, reject) => {
			const callback = (error: Error, result: T) => {
				if (error) {
					console.error('ERROR', error);
					reject(error);
				} else {
					resolve(result);
				}
			};
			args.push(callback);
			func(...args);
		});
	}

	public static async entries(directory: string, nameOnly: boolean = true): Promise<string[]> {
		const options: glob.IOptions = {
			ignore: [
				directory,
				'**/node_modules/**'
			],
			nosort: true,
			mark: true
		};
		let entries = await this._async<string[]>(glob, Path.join(directory, '**'), options);
		entries.sort(this._sort.bind(this));
		if (nameOnly) {
			entries = entries.map(self => Path.basename(self));
		}
		return entries;
	}

	public static rootDir(): string {
		return process.cwd();
	}

	public static async at(path: string): Promise<string> {
		return await this._async<string>(fs.readFile, path, 'utf8');
	}

	public static async create(path: string, content: string = 'empty'): Promise<boolean> {
		this.mkdir(Path.dirname(path));
		await this._async<boolean>(fs.writeFile, path, content, 'utf8');
		return true;
	}

	public static async update(path: string, content: string): Promise<boolean> {
		await this._async<boolean>(fs.writeFile, path, content, 'utf8');
		return true;
	}

	public static async rename(path: string, to: string): Promise<boolean> {
		await this._async<boolean>(fs.rename, path, to);
		return true;
	}

	public static async remove(path: string): Promise<boolean> {
		if (this.isFile(path)) {
			await this._async<boolean>(fs.unlink, path);
		} else {
			await this._async<boolean>(fs.rmdir, path);
		}
		return true;
	}

	public static isFile(path: string): boolean {
		return !path.endsWith('/');
	}

	public static async exists(path: string): Promise<boolean> {
		return (await this._async<boolean>(fs.stat, path)) !== null;
	}

	public static async mkdir(path: string): Promise<void> {
		await this._async<void>(exec, `mkdir -p ${path}`); // XXX exec...
	}

	public static _sort(a: string, b: string): number {
		if (this.isFile(a)) {
			a = `${Path.dirname(a)}/z_${Path.basename(a)}`;
		}
		if (this.isFile(b)) {
			b = `${Path.dirname(b)}/z_${Path.basename(b)}`;
		}
		return a > b ? 1 : -1;
	}
}
