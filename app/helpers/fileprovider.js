'use strict';

const fs = require('fs');
const Path = require('path');
const glob = require('glob');
const Promise = require('promise');
const exec = require('child_process').exec;

class FileProvider {
	/**
	 * Get all entry paths from target directory
	 * @param string directory Target directory
	 * @param bool nameOnly Result to file name
	 * @return string[] Entry paths
	 * @throws no such file or directory
	 */
	static entries (directory, nameOnly = true) {
		return new Promise((resolve, reject) => {
			const options = {
				ignore: [
					directory,
					'**/node_modules/**'
				],
				nosort: true,
				mark: true
			};
			glob.glob(Path.join(directory, '**'), options, (error, entries) => {
				if (error !== null) {
					reject(error);
				} else {
					entries.sort(FileProvider.sort);
					if (nameOnly) {
						entries = entries.map((self) => {
							return self.substr(directory.length);
						});
					}
					resolve(entries);
				}
			});
		});
	}
	
	/**
	 * Get file content by path
	 * @param string path File path
	 * @return string File content
	 * @throws no such file or directory
	 * @throws illegal operation on a directory, read
	 */
	static at (path) {
		return new Promise((resolve, reject) => {
				fs.readFile(path, 'utf8', (error, entry) => {
				if (error !== null) {
					reject(error);
				} else {
					resolve(entry);
				}
			});
		});
	}
	
	/**
	 * Create by path and content
	 * @param string path File save path
	 * @param string content File content
	 * @throws no such file or directory
	 */
	static create (path, content = '') {
		return new Promise((resolve, reject) => {
			const dir = Path.dirname(path);
			FileProvider.mkdir(dir).then(() => {
				fs.writeFile(path, content, 'utf8', (error) => {
					if (error !== null) {
						reject(error);
					} else {
						resolve(true);
					}
				});
			});
		});
	}
	
	/**
	 * Update by path and content
	 * @param string path File save path
	 * @param string content File content
	 * @throws no such file or directory
	 */
	static update (path, content) {
		return new Promise((resolve, reject) => {
			fs.writeFile(path, content, 'utf8', (error) => {
				if (error !== null) {
					reject(error);
				} else {
					resolve(true);
				}
			});
		});
	}
	
	/**
	 * Rename by path changed to path
	 * @param string path Entry from path
	 * @param string to Entry to path
	 * @throws no such file or directory
	 */
	static rename (path, to) {
		return new Promise((resolve, reject) => {
			fs.rename(path, to, (error) => {
				if (error !== null) {
					reject(error);
				} else {
					resolve(true);
				}
			});
		});
	}
	
	/**
	 * Remove by path
	 * @param string path Entry path
	 * @throws no such file or directory
	 */
	static remove (path) {
		return new Promise((resolve, reject) => {
			// XXX
			let func = 'unlink';
			if (!FileProvider.isFile(path)) {
				func = 'rmdir';
			}
			fs[func](path, (error) => {
				if (error !== null) {
					reject(error);
				} else {
					resolve(true);
				}
			});
		});
	}
	
	/**
	 * Checking for path is file. Expect without ends with path separator
	 * @param string path Entry path
	 * @return bool Entry is file 'true'
	 * @throws no such file or directory
	 */
	static isFile (path) {
		return !path.endsWith('/');
		// XXX slowest
		// try {
		// 	return fs.statSync(path).isFile();
		// } catch (error) {
		// 	console.error(error);
		// 	return false;
		// }
	}
	
	/**
	 * Exists by path
	 * @param string path Entry path
	 * @return bool existing to true
	 */
	static exists (path) {
		return new Promise((resolve, reject) => {
			fs.stat(path, (error, stats) => {
				if (error !== null) {
					reject(error);
				} else {
					resolve(true);
				}
			});
		});
	}
	
	/**
	 * Create directory by path
	 * @param string path Directory path
	 */
	static mkdir (path) {
		return new Promise((resolve, reject) => {
			// XXX
			exec(`mkdir -p ${path}`, (error) => {
				if (error !== null) {
					reject(error);
				} else {
					resolve(true);
				}
			});
		});
	}
	
	/**
	 * Sorted entries
	 * @param string a target a
	 * @param string b target b
	 * @return int Compared result
	 */
	static sort (a, b) {
		if (FileProvider.isFile(a)) {
			a = Path.dirname(a) + '/z_' + Path.basename(a);
		}
		if (FileProvider.isFile(b)) {
			b = Path.dirname(b) + '/z_' + Path.basename(b);
		}
		return a > b ? 1 : -1;
	}
}

module.exports = FileProvider;
