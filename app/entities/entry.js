'use strict';

const FileProvider = require('../helpers/fileprovider');
const Path = require('path');
const Promise = require('promise');

/** XXX root directory */
const ROOT_DIRECTORY = '/opt/app';

class Entry {
	/**
	 * Create instance
	 * @param string realPath real path
	 * @param strring isFile is file type
	 * @param byte[] content content
	 */
	constructor (realPath, isFile, content) {
		const relPath = Entry._toRelativePath(realPath);
		const isText = Entry._isText(Path.basename(relPath));
		this.path = relPath;
		this.isFile = isFile;
		this.isText = isText;
		this.content = content;
		if (isFile && content.length > 0) {
			if (isText) {
				this.content = content.toString('utf8');
			} else {
				this.content = Entry._toHex(content);
			}
		}

	}

	/**
	 * Get keys
	 * @return string[] keys
	 */
	static keys () {
		return ['path', 'isFile', 'isText', 'content'];
	}

	/**
	 * Get all entries from '/opt/app'
	 * @param string relDirPath Target directory relative path from '/opt/app'
	 * @return Promise Return the Promise instance
	 */
	static entries (relDirPath = '') {
		const realDirPath = Entry._toRealPath(relDirPath);
		return FileProvider.entries(realDirPath, false)
			.then((entries) => {
				return entries.map((entity) => {
					const relPath = Entry._toRelativePath(entity);
					const isFile = Entry._isFile(entity);
					return new Entry(entity, isFile, '');
				});
			});
	}

	/**
	 * Find at entry
	 * @param string relPath Entry relative path from '/opt/app'
	 * @return Promise Return the Promise instance
	 */
	static at (relPath) {
		const realPath = Entry._toRealPath(relPath);
		const isFile = Entry._isFile(realPath);
		if (isFile) {
			return FileProvider.at(realPath)
				.then((content) => {
					return new Entry(realPath, isFile, content);
				});
		} else {
			return new Promise((resolve, reject) => {
				resolve(new Entry(realPath, isFile, ''));
			});
		}
	}

	/**
	 * Create by path
	 * @param string relPath Entry relative path from '/opt/app'
	 * @return Promise Return the Promise instance
	 */
	static create (relPath) {
		const realPath = Entry._toRealPath(relPath);
		return FileProvider.create(realPath);
	}

	/**
	 * Update by path and content body
	 * @param string relPath Entry relative path from '/opt/app'
	 * @param string content Entry content body
	 * @return Promise Return the Promise instance
	 */
	static update (relPath, content) {
		const realPath = Entry._toRealPath(relPath);
		return FileProvider.update(realPath, content);
	}

	/**
	 * Rename by path and to path
	 * @param string relPath Entry relative path from '/opt/app'
	 * @param string relToPath Entry to relative path
	 * @return Promise Return the Promise instance
	 */
	static rename (relPath, relToPath) {
		return FileProvider.rename(Entry._toRealPath(relPath), Entry._toRealPath(relToPath));
	}

	/**
	 * Destroy by path
	 * @param string relPath Entry relative path from '/opt/app'
	 * @return Promise Return the Promise instance
	 */
	static destroy (relPath) {
		return FileProvider.remove(Entry._toRealPath(relPath));
	}

	/**
	 * Check entry is file
	 * @param string realPath Entity real path
	 * @return boolean entry is file of true
	 */
	static _isFile (realPath) {
		return FileProvider.isFile(realPath);
	}

	/**
	 * Relative path to real path
	 * @param string relPath Entry relative path
	 * @return string Real path
	 */
	static _toRealPath (relPath) {
		return ROOT_DIRECTORY + relPath;
	}

	/**
	 * Real path to Relative path
	 * @param string realPath Entry real path
	 * @return string Relative path
	 */
	static _toRelativePath (realPath) {
		return realPath.substr(ROOT_DIRECTORY.length);
	}

	/**
	 * Convert bytes to hex string
	 * @param byte[] Content bytes
	 * @return string Hex string
	 */
	static _toHex (content) {
		return new Buffer(content).toString('hex');
	}

	/**
	 * Check file type is text
	 * @param string File name
	 * @return boolean Text is true
	 */
	static _isText (name) {
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

module.exports = Entry;
