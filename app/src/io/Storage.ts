import * as fs from 'fs';
import * as Path from 'path';
import * as glob from 'glob';
import {execSync} from 'child_process';

export default class Storage {
	public static entries(directory: string, nameOnly: boolean = true): string[] {
		const options: glob.IOptions = {
			ignore: [
				directory,
				'**/node_modules/**'
			],
			nosort: true,
			mark: true
		};
		try {
			let entries = glob.sync(Path.join(directory, '**'), options);
			entries.sort(this._sort);
			if (nameOnly) {
				entries = entries.map(self => Path.basename(self));
			}
			return entries;
		} catch (error) {
			console.error('ERROR', error);
			throw error;
		}
	}

	public static rootDir(): string {
		return process.cwd();
	}

	public static at(path: string): string {
		try {
			return fs.readFileSync(path, 'utf8');
		} catch (error) {
			console.error('ERROR', error);
			throw error;
		}
	}

	public static create(path: string, content: string = 'empty'): void {
		try {
			this.mkdir(Path.dirname(path));
			fs.writeFileSync(path, content, 'utf8');
		} catch (error) {
			console.error('ERROR', error);
			throw error;
		}
	}

	public static update(path: string, content: string): void {
		try {
			fs.writeFileSync(path, content, 'utf8');
		} catch (error) {
			console.error('ERROR', error);
			throw error;
		}
	}

	public static rename(path: string, to: string): void {
		try {
			fs.rename(path, to);
		} catch (error) {
			console.error('ERROR', error);
			throw error;
		}
	}

	public static remove(path: string): void {
		try {
			if (this.isFile(path)) {
				fs.unlinkSync(path);
			} else {
				fs.rmdirSync(path);
			}
		} catch (error) {
			console.error('ERROR', error);
			throw error;
		}
	}

	public static isFile(path: string): boolean {
		return !path.endsWith('/');
	}

	public static exists(path: string): boolean {
		try {
			return fs.statSync(path) !== null;
		} catch (error) {
			console.error('ERROR', error);
			throw error;
		}
	}

	public static mkdir(path: string): void {
		try {
			execSync(`mkdir -p ${path}`); // XXX exec...
		} catch (error) {
			console.error('ERROR', error);
			throw error;
		}
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
