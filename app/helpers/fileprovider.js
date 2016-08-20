'use strict';

let fs = require('fs');
let Path = require('path');
let glob = require('glob');

class FileProvider {
	/**
	 * Get all entry paths from target directory
	 * @param string directory Target directory
	 * @param bool nameOnly Result to file name
	 * @return string[] Entry paths
	 * @throws no such file or directory
	 */
	static entries (directory, nameOnly = true) {
		let options = {
			ignore: ['**/node_modules/**']
			// nosort: true
		};
		let entries = glob.sync(directory + '/**', options);
		entries.sort(FileProvider.sort);
		if (nameOnly) {
			return entries.map((self) => {
				return self.substr(directory.length);
			});
		}
		return entries;
	}
	
	/**
	 * Get file content by path
	 * @param string path File path
	 * @return string File content
	 * @throws no such file or directory
	 * @throws illegal operation on a directory, read
	 */
	static at (path) {
		return fs.readFileSync(path, 'utf8');
	}
	
	/**
	 * Create by path and content
	 * @param string path File save path
	 * @param string content File content
	 * @throws no such file or directory
	 */
	static create (path, content) {
		let dir = Path.dirname(path);
		if (!FileProvider.exists(dir)) {
			FileProvider.mkdir(dir);
		}
		fs.writeFileSync(path, content, 'utf8');
	}
	
	/**
	 * Update by path and content
	 * @param string path File save path
	 * @param string content File content
	 * @throws no such file or directory
	 */
	static update (path, content) {
		fs.writeFileSync(path, content, 'utf8');
	}
	
	/**
	 * Rename by path changed to path
	 * @param string path Entry from path
	 * @param string to Entry to path
	 * @throws no such file or directory
	 */
	static rename (path, to) {
		fs.rename(path, to);
	}
	
	/**
	 * Remove by path
	 * @param string path Entry path
	 * @throws no such file or directory
	 */
	static remove (path) {
		fs.unlink(path);
	}
	
	/**
	 * Checking for path is file
	 * @param string path Entry path
	 * @return bool Entry is file 'true'
	 * @throws no such file or directory
	 */
	static isFile (path) {
		try {
			let stat = fs.statSync(path);
			return stat.isFile();
		} catch (error) {
			console.error(error);
			return false;
		}
	}
	
	/**
	 * Exists by path
	 * @param string path Entry path
	 * @return bool existing to true
	 */
	static exists (path) {
		try {
			fs.statSync(path);
			return true;
		} catch (error) {
			return false;
		}
	}
	
	/**
	 * Create directory by path
	 * @param string path Directory path
	 */
	static mkdir (path) {
		let dirs = path.split('/');
		let curr = '';
		for (let dir of dirs) {
			curr += '/' + dir;
			if (!FileProvider.exists(curr)) {
				fs.mkdirSync(curr);
			}
		}
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
